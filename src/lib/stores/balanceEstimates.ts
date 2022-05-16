import { browser } from '$app/env';
import type { Block } from '@ethersproject/abstract-provider';
import { get, writable } from 'svelte/store';
import type { Dripping_address_uint256_address_uint128_uint64_Event } from './drips/contracts/types/DaiDripsHub/DaiDripsHubAbi';
import { walletStore } from './wallet/wallet';
import drips from './drips/index';
import { Currency, WorkstreamState, type Money } from './workstreams/types';
import { workstreamsStore } from './workstreams/workstreams';

interface DrippingEventWrapper {
  event: Dripping_address_uint256_address_uint128_uint64_Event;
  fromBlock: Block;
}

interface BalanceEstimatesState {
  totalBalance: bigint | undefined;
  streams: {
    [activeWorkstreamId: string]: {
      currentBalance: Money | undefined;
      drippingEvents: DrippingEventWrapper[];
      fromBlock: Block;
    };
  };
}

interface InternalState {
  currentCycleStart: Date;
  currentCollectable: Money;
}

export default (() => {
  const store = writable<BalanceEstimatesState>({
    totalBalance: undefined,
    streams: {}
  });

  const internal = writable<InternalState | undefined>(undefined);

  async function init() {
    if (!browser) throw new Error('Cannot init balance estimates server-side');

    const cycleSecs = await drips.getCycleSecs();

    const currentCycleSecs =
      BigInt(Math.floor(Date.now() / 1000)) % cycleSecs.toBigInt();
    const currentCycleStart = new Date(
      new Date().getTime() - Number(currentCycleSecs) * 1000
    );

    const currentCollectable = await drips.getCollectable();

    internal.set({
      currentCycleStart,
      currentCollectable: {
        currency: Currency.DAI,
        wei: currentCollectable
      }
    });

    setInterval(estimateBalance, 1000);
  }

  workstreamsStore.subscribe(async (wss) => {
    const incomingStreamIds = Object.keys(wss).filter((k) => {
      const ws = wss[k].data;
      const ownAddress = get(walletStore).accounts[0];

      return (
        ws.state === WorkstreamState.ACTIVE &&
        ws.acceptedApplication === ownAddress
      );
    });

    let result: BalanceEstimatesState;

    for (const id of incomingStreamIds) {
      if (get(store)[id]) continue;

      const ws = wss[id].data;

      if (ws.dripsData?.accountId)
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
      const block = drippingEvents[0].fromBlock;

      result = {
        ...result,
        streams: {
          ...result?.streams,
          [id]: {
            currentBalance: {
              wei: undefined,
              currency: Currency.DAI
            },
            drippingEvents,
            fromBlock: block
          }
        }
      };
    }

    if (result) store.set(result);
  });

  function estimateBalance() {
    const internalState = get(internal);
    if (!internalState) return;

    store.update((vs) => {
      const { currentCycleStart } = internalState;

      const secondsSinceCycleStart = Math.floor(
        (new Date().getTime() - currentCycleStart.getTime()) / 1000
      );

      for (const [wsId, v] of Object.entries(vs.streams)) {
        const { drippingEvents } = v;

        if (drippingEvents.length === 1) {
          const earnedSinceCycleStart =
            BigInt(secondsSinceCycleStart) *
            drippingEvents[0].event.args.amtPerSec.toBigInt();

          vs.streams[wsId].currentBalance = {
            wei: earnedSinceCycleStart,
            currency: vs.streams[wsId].currentBalance.currency
          };
        } else if (drippingEvents.length > 1) {
          let earnedSinceCycleStart: bigint;

          const drippingEventsDuringCurrentCycle = drippingEvents.filter(
            (ew) => new Date(ew.fromBlock.timestamp) > currentCycleStart
          );

          drippingEventsDuringCurrentCycle.forEach((ew, i) => {
            const nextEw = drippingEventsDuringCurrentCycle[i + 1];

            const nextUpdateTimestamp = nextEw
              ? new Date(nextEw.fromBlock.timestamp).getTime()
              : new Date().getTime();
            const updateValidForSecs =
              nextUpdateTimestamp - new Date(ew.fromBlock.timestamp).getDate();

            earnedSinceCycleStart +=
              BigInt(updateValidForSecs) * ew.event.args.amtPerSec.toBigInt();
          });

          vs.streams[wsId].currentBalance = {
            wei: earnedSinceCycleStart,
            currency: vs.streams[wsId].currentBalance.currency
          };
        } else {
          throw new Error(`Drips not set up for active workstream ${wsId}`);
        }
      }

      const { currentCollectable } = internalState;

      const totalWeiFromCurrentCycle = Object.values(vs.streams).reduce<bigint>(
        (acc, val) => {
          return acc + val.currentBalance.wei;
        },
        BigInt(0)
      );

      vs.totalBalance = currentCollectable.wei + totalWeiFromCurrentCycle;

      return vs;
    });
  }

  return {
    init,
    subscribe: store.subscribe
  };
})();
