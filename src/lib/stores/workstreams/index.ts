import { get, writable } from 'svelte/store';
import type { Block } from '@ethersproject/abstract-provider';
import {
  Currency,
  WorkstreamState,
  type Money,
  type Workstream
} from '$lib/stores/workstreams/types';
import { getConfig } from '$lib/config';
import type {
  DripsConfig_dripsConfig_dripsAccount,
  DripsConfig_dripsConfig_dripsEntries
} from '$lib/api/__generated__/dripsConfig';
import type { DripsUpdated_address_uint256_uint128_tuple_array_Event } from '../drips/contracts/types/DaiDripsHub/DaiDripsHubAbi';
import type { ethers } from 'ethers';
import getDripsAccount from './methods/getDripsAccount';
import getDripsUpdatedEvents from './methods/getDripsUpdatedEvents';
import bigIntMin from './methods/bigIntMin';
import fetchEstimationWs from './methods/fetchEstimationWs';
import type { Cycle } from '../drips';

export const reviver: (key: string, value: unknown) => unknown = (
  key,
  value
) => {
  let output = value;

  if (key === 'wei' && typeof value === 'string') {
    output = BigInt(value);
  }

  return output;
};

export interface WorkstreamsFilterConfig {
  applied: 'true' | 'false';
  state: WorkstreamState;
  createdBy: string;
  hasApplicationsToReview: 'true' | 'false';
  assignedTo: string;
}

interface WorkstreamsState {
  [workstreamId: string]: EnrichedWorkstream;
}

export interface EnrichedWorkstream {
  fetchedAt: Date;
  onChainData?: OnChainData;
  data: Workstream;
}

export interface DrippingEventWrapper {
  event: DripsUpdated_address_uint256_uint128_tuple_array_Event;
  fromBlock: Block;
}

export interface OnChainData {
  amtPerSec: Money;
  dripsEntries: DripsConfig_dripsConfig_dripsEntries[];
  dripsAccount: DripsConfig_dripsConfig_dripsAccount;
  dripsUpdatedEvents: DrippingEventWrapper[];
}

interface InternalState {
  provider: ethers.providers.Web3Provider;
  chainId: number;
  currentCycleStart: Date;
  currentAddress: string;
  intervalId: NodeJS.Timer;
}

interface Estimate {
  currentBalance: Money;
  remainingBalance: Money;
  streamingUntil: Date;
}

interface EstimatesState {
  streams: { [wsId: string]: Estimate };
  totalBalance?: Money;
}

export const workstreamsStore = (() => {
  const workstreams = writable<WorkstreamsState>({});
  const estimates = writable<EstimatesState>({ streams: {} });
  const internal = writable<InternalState | undefined>();

  function clear() {
    clearInterval(get(internal).intervalId);

    workstreams.set({});
    internal.set(undefined);
  }

  /**
   * Connect the store to the chain in order to enable on-chain enrichment
   * and balance estimates for active workstreams.
   */
  async function connect(
    provider: ethers.providers.Web3Provider,
    cycle: Cycle
  ) {
    if (get(internal)) return;

    const address = (await provider.getSigner().getAddress()).toLowerCase();

    internal.set({
      provider,
      chainId: provider.network.chainId,
      currentCycleStart: cycle.start,
      currentAddress: address,
      intervalId: setInterval(estimateBalances, 1000)
    });

    await fetchEstimationWs(address);
  }

  async function enrich(item: Workstream): Promise<EnrichedWorkstream> {
    const internalState = get(internal);

    // User isn't logged in, so no need to enrich with on-chain data.
    if (!internalState)
      return {
        data: item,
        fetchedAt: new Date()
      };

    const { currentAddress, chainId } = internalState;
    const workstreamAssociatedWithUser =
      currentAddress === item.creator ||
      currentAddress === item.acceptedApplication;

    // Only enrich workstreams that the user is assigned to or is receiving funds from.
    if (!workstreamAssociatedWithUser || item.state !== WorkstreamState.ACTIVE)
      return {
        data: item,
        fetchedAt: new Date()
      };

    const { id, creator, acceptedApplication: assignee, dripsData } = item;

    if (!dripsData) throw new Error(`No drips data for ws ${id}`);

    const [dripsAccount, dripsUpdatedEvents] = await Promise.all([
      getDripsAccount(creator, dripsData.accountId, chainId),
      getDripsUpdatedEvents(creator, dripsData.accountId)
    ]);

    if ([dripsAccount, dripsUpdatedEvents].find((v) => !v)) {
      throw new Error(`Unable to query on-chain state for workstream ${id}`);
    }

    const amtPerSec = {
      wei: BigInt(
        dripsAccount.dripsEntries.find(
          (e) => (e.receiver as string).toLowerCase() === assignee
        ).amtPerSec
      ),
      currency: Currency.DAI
    };

    return {
      data: item,
      fetchedAt: new Date(),
      onChainData: {
        amtPerSec,
        dripsUpdatedEvents: dripsUpdatedEvents,
        dripsEntries: dripsAccount.dripsEntries,
        dripsAccount: dripsAccount
      }
    };
  }

  function estimateBalances() {
    const ws = get(workstreams);

    const newEstimates: { [wsId: string]: Estimate } = {};

    for (const [wsId, v] of Object.entries(ws)) {
      if (!v.onChainData) continue;

      const { dripsUpdatedEvents } = v.onChainData;

      if (dripsUpdatedEvents.length === 0) {
        throw new Error(`Drips not set up for active workstream ${wsId}`);
      }

      let earned = BigInt(0);
      let remainingBalance = BigInt(0);

      /*
        Iterate over all `dripsUpdated` events associated with the
        particular drips subaccount linked to the workstream.
      */
      dripsUpdatedEvents.forEach((dew, i) => {
        const nextDew = dripsUpdatedEvents[i + 1];

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

        const amtPerSec = dew.event.args.receivers[0].amtPerSec.toBigInt();

        /* 
          If the theoretically earned amount from this workstream exceeds
          the balance that the workstream was topped up for at the time
          of the update, we limit the amount earned to the topped-up amount.
        */
        const earnedDuringUpdate = bigIntMin(
          BigInt(updateValidForSecs) * amtPerSec,
          toppedUpAmount
        );

        earned += earnedDuringUpdate;

        if (!nextDew) {
          remainingBalance = toppedUpAmount - earnedDuringUpdate;
        }
      });

      const lastUpdate = dripsUpdatedEvents[dripsUpdatedEvents.length - 1];
      const currAmtPerSec =
        lastUpdate.event.args.receivers[0].amtPerSec.toBigInt();
      const lastUpdateTimestamp = lastUpdate.fromBlock.timestamp * 1000;
      const streamingUntil = new Date(
        lastUpdateTimestamp +
          Number(lastUpdate.event.args.balance.toBigInt() / currAmtPerSec) *
            1000
      );

      newEstimates[wsId] = {
        currentBalance: {
          wei: earned,
          currency: Currency.DAI
        },
        remainingBalance: {
          wei: remainingBalance,
          currency: Currency.DAI
        },
        streamingUntil
      };
    }

    /*
      Sum up the amount earned from all active streams in the store to
      calculcate the global earned amount.
    */
    const totalWeiEarned = Object.entries(newEstimates).reduce<bigint>(
      (acc, [wsId, val]) => {
        if (!val) return acc;

        const direction =
          ws[wsId].data.creator === get(internal).currentAddress
            ? 'outgoing'
            : 'incoming';

        return direction === 'incoming' ? acc + val.currentBalance.wei : acc;
      },
      BigInt(0)
    );

    estimates.update((estimatesVal) => ({
      totalBalance: {
        wei: totalWeiEarned,
        currency: Currency.DAI
      },
      streams: {
        ...estimatesVal.streams,
        ...newEstimates
      }
    }));
  }

  async function pushState(enrichedWorkstreams: EnrichedWorkstream[]) {
    workstreams.update((v) => {
      let toAppend = {};

      for (const enrichedWorkstream of enrichedWorkstreams) {
        toAppend = {
          ...toAppend,
          [enrichedWorkstream.data.id]: enrichedWorkstream
        };
      }

      return { ...v, ...toAppend };
    });
  }

  function serveFromCache(
    id: string
  ): { ok: true; data: Workstream } | undefined {
    const data = get(workstreams)[id]?.data;

    return data
      ? {
          ok: true,
          data
        }
      : undefined;
  }

  async function getWorkstreams(
    filters?: Partial<WorkstreamsFilterConfig>,
    fetcher?: typeof fetch
  ) {
    const paramsString =
      filters && Object.keys(filters).length > 0
        ? new URLSearchParams(filters).toString()
        : '';

    const url = `${getConfig().API_URL_BASE}/workstreams?${paramsString}`;

    const response = await _fetch(url, undefined, fetcher);

    if (response.status === 200) {
      const parsed = JSON.parse(await response.text(), reviver) as Workstream[];
      const enrichPromises = parsed.map((w) => enrich(w));

      const enriched = await Promise.all(enrichPromises);

      pushState(enriched);

      return {
        data: parsed,
        enriched,
        ok: true
      };
    } else {
      return {
        ok: false,
        error: await response.text()
      };
    }
  }

  async function getWorkstream(id: string, fetcher?: typeof fetch) {
    if (serveFromCache(id)) return serveFromCache(id);

    const url = `${getConfig().API_URL_BASE}/workstreams/${id}`;
    const response = await _fetch(url, undefined, fetcher);

    if (response.ok) {
      const parsed = JSON.parse(await response.text(), reviver) as Workstream;

      const enriched = await enrich(parsed);

      pushState([enriched]);

      return {
        data: parsed,
        enriched,
        ok: true
      };
    } else {
      return {
        ok: false,
        error: await response.text()
      };
    }
  }

  async function activateWorkstream(
    id: string,
    accountId: number,
    fetcher?: typeof fetch
  ) {
    const url = `${getConfig().API_URL_BASE}/workstreams/${id}/activate`;
    const response = await _fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify({
          accountId
        })
      },
      fetcher
    );

    if (response.ok) {
      workstreams.update((v) => {
        const workstreamInState = v[id];

        if (workstreamInState) {
          v[id] = {
            ...v[id],
            data: {
              ...v[id].data,
              state: WorkstreamState.ACTIVE
            }
          };
        }

        return v;
      });

      return {
        ok: true
      };
    } else {
      return {
        ok: false,
        error: await response.text()
      };
    }
  }

  async function _fetch(
    url: string,
    config?: RequestInit,
    fetcher?: typeof fetch
  ) {
    return (fetcher || fetch)(url, {
      ...(config as object),
      credentials: 'include'
    });
  }

  return {
    subscribe: workstreams.subscribe,
    estimates: {
      subscribe: estimates.subscribe
    },
    connect,
    clear,
    getWorkstreams,
    getWorkstream,
    activateWorkstream
  };
})();
