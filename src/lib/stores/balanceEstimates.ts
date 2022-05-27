import type { Block } from '@ethersproject/abstract-provider';
import { get, writable } from 'svelte/store';
import type { DripsUpdated_address_uint256_uint128_tuple_array_Event } from './drips/contracts/types/DaiDripsHub/DaiDripsHubAbi';
import { walletStore } from './wallet/wallet';
import drips from './drips/index';
import { Currency, WorkstreamState, type Money } from './workstreams/types';
import { workstreamsStore } from './workstreams/workstreams';
import { browser } from '$app/env';

interface DrippingEventWrapper {
  event: DripsUpdated_address_uint256_uint128_tuple_array_Event;
  fromBlock: Block;
}

interface BalanceEstimatesState {
  totalBalance: bigint | undefined;
  streams: {
    [activeWorkstreamId: string]: {
      direction: 'incoming' | 'outgoing';
      currentBalance?: Money;
      remainingBalance?: Money;
      drippingEvents: DrippingEventWrapper[];
      fromBlock: Block;
    };
  };
}

interface InternalState {
  currentCycleStart: Date;
  currentCollectable: Money;
  currentAddress: string;
}

function bigintMin(...args: bigint[]): bigint {
  if (args.length < 1) {
    throw 'Min of empty list';
  }
  let m = args[0];
  args.forEach((a) => {
    if (a < m) {
      m = a;
    }
  });
  return m;
}

export default (() => {
  const store = writable<BalanceEstimatesState>({
    totalBalance: undefined,
    streams: {}
  });

  const internal = writable<InternalState | undefined>(undefined);

  /**
   * Initialize the store by fetching the cycle length from the Drips Hub
   * contract and populating private store values. Must be called once to
   * start estimation. A wallet must be connected and initialized via WalletStore.
   */
  async function init() {
    if (!browser) throw new Error('Cannot init balance estimates server-side');

    const cycleSecs = await drips.getCycleSecs();

    const currentCycleSecs =
      BigInt(Math.floor(Date.now() / 1000)) % cycleSecs.toBigInt();
    const currentCycleStart = new Date(
      new Date().getTime() - Number(currentCycleSecs) * 1000
    );

    const currentCollectable = await drips.getCollectable();
    const currentAddress = get(walletStore).accounts[0];

    store.set({
      totalBalance: undefined,
      streams: {}
    });

    // Ensure all workstreams assigned to user are in local state
    await workstreamsStore.getWorkstreams({
      assignedTo: currentAddress
    });

    // Ensure all workstreams assigned to user are in local state
    await workstreamsStore.getWorkstreams({
      createdBy: currentAddress
    });

    internal.set({
      currentCycleStart,
      currentAddress: get(walletStore).accounts[0],
      currentCollectable: {
        currency: Currency.DAI,
        wei: currentCollectable
      }
    });

    setInterval(estimateBalance, 1000);
  }

  /**
   * Automatically initialize the store if the user connects a wallet (or
   * changes the selected account).
   */
  walletStore.subscribe((v) => {
    const internalState = get(internal);
    if (v.accounts[0] !== internalState?.currentAddress) {
      init();
    }
  });

  /**
   * Subscribe to newly fetched workstreams and automatically begin
   * calculating the estimated total for all active workstreams assigned
   * to the currently logged-in user.
   */
  workstreamsStore.subscribe(async (wss) => {
    const ownAddress = get(walletStore).accounts[0];

    const streamIds = Object.keys(wss).filter((k) => {
      const ws = wss[k].data;

      return (
        ws.state === WorkstreamState.ACTIVE &&
        (ws.acceptedApplication === ownAddress || ws.creator === ownAddress)
      );
    });

    let result: BalanceEstimatesState;

    for (const id of streamIds) {
      const ws = wss[id].data;

      if (ws.dripsData?.accountId === undefined)
        throw new Error(`No drips config for active workstream ${id}`);

      const events = await drips.getDripsUpdatedEvents(
        ws.creator,
        ws.dripsData.accountId
      );

      const drippingEventsPromises: Promise<DrippingEventWrapper>[] =
        events.map(
          (e) =>
            new Promise((resolve) => {
              e.getBlock().then((block) =>
                resolve({ fromBlock: block, event: e })
              );
            })
        );

      const drippingEvents = await Promise.all(drippingEventsPromises);

      if (drippingEvents.length === 0) {
        throw new Error(`No dripping events for active workstream ${id}`);
      }

      const block = drippingEvents[0].fromBlock;

      result = {
        ...result,
        streams: {
          ...result?.streams,
          [id]: {
            drippingEvents,
            fromBlock: block,
            direction: ws.creator === ownAddress ? 'outgoing' : 'incoming'
          }
        }
      };
    }

    if (result) store.set(result);
  });

  /**
   * Gets called once per second and calculates the current total balance
   * of all active workstreams assigned to the current user, and at the end
   * updates the total global balance from all workstreams.
   */
  function estimateBalance() {
    const internalState = get(internal);
    if (!internalState) return;

    store.update((vs) => {
      for (const [wsId, v] of Object.entries(vs.streams)) {
        const { drippingEvents } = v;

        if (drippingEvents.length === 0) {
          throw new Error(`Drips not set up for active workstream ${wsId}`);
        }

        let earned = BigInt(0);
        let remainingBalance = BigInt(0);

        /*
          Iterate over all `dripsUpdated` events associated with the
          particular drips subaccount linked to the workstream.
        */
        drippingEvents.forEach((dew, i) => {
          const nextDew = drippingEvents[i + 1];

          const toppedUpAmount = dew.event.args.balance.toBigInt();

          const nextUpdateTimestamp = nextDew
            ? new Date(nextDew.fromBlock.timestamp * 1000).getTime()
            : new Date().getTime();

          /*
            Count the amount of seconds the current `dripsUpdated` event
            has been valid for so far — either until the next `dripsUpdated`
            event, or until the current time if it is the latest one.
          */
          const updateValidForSecs = Math.floor(
            (nextUpdateTimestamp -
              new Date(dew.fromBlock.timestamp * 1000).getTime()) /
              1000
          );

          /* 
            If the theoretically earned amount from this workstream exceeds
            the balance that the workstream was topped up for at the time
            of the update, we limit the amount earned to the topped-up amount.
          */
          const earnedDuringUpdate = bigintMin(
            BigInt(updateValidForSecs) *
              dew.event.args.receivers[0].amtPerSec.toBigInt(),
            toppedUpAmount
          );

          earned += earnedDuringUpdate;

          if (!nextDew) {
            remainingBalance = toppedUpAmount - earnedDuringUpdate;
          }
        });

        vs.streams[wsId].currentBalance = {
          wei: earned,
          currency: Currency.DAI
        };

        vs.streams[wsId].remainingBalance = {
          wei: remainingBalance,
          currency: Currency.DAI
        };
      }

      /*
        Sum up the amount earned from all active streams in the store to
        calculcate the global earned amount.
      */
      const totalWeiEarned = Object.values(vs.streams).reduce<bigint>(
        (acc, val) => {
          return val.direction === 'incoming'
            ? acc + val.currentBalance.wei
            : acc;
        },
        BigInt(0)
      );

      vs.totalBalance = totalWeiEarned;

      return vs;
    });
  }

  return {
    init,
    subscribe: store.subscribe
  };
})();
