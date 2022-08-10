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
} from '$lib/api/drips-subgraph/__generated__/dripsConfig';
import type { DripsUpdated_address_uint256_uint128_tuple_array_Event } from '../drips/contracts/types/DaiDripsHub/DaiDripsHubAbi';
import getDripsAccount from './methods/getDripsAccount';
import getDripsUpdatedEvents from './methods/getDripsUpdatedEvents';
import fetchRelevantWorkstreams from './methods/fetchRelevantWorkstreams';
import type { Cycle } from '../drips';
import tick from '../tick';
import { streamedBetween } from '../drips/utils/streamedBetween';

export const reviver: (key: string, value: unknown) => unknown = (
  key,
  value
) => {
  let output = value;

  if (
    (key === 'wei' && typeof value === 'string') ||
    (key === 'accountId' && typeof value === 'string')
  ) {
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
  chainId: string;
}

interface WorkstreamsState {
  fetchStatus: {
    relevantStreamsFetched: boolean | 'error';
    relevantStreamsFetching: boolean;
  };
  workstreams: { [workstreamId: string]: EnrichedWorkstream };
}

export interface EnrichedWorkstream {
  fetchedAt: Date;
  onChainData?: OnChainData;
  data: Workstream;
  relevant: boolean;
  direction?: 'incoming' | 'outgoing';
}

export interface DrippingEventWrapper {
  event: DripsUpdated_address_uint256_uint128_tuple_array_Event;
  fromBlock: Block;
}

export interface OnChainData {
  amtPerSec: Money;
  dripsEntries: DripsConfig_dripsConfig_dripsEntries[];
  dripsAccount: DripsConfig_dripsConfig_dripsAccount;
  streamSetUp: boolean;
  dripsUpdatedEvents: DrippingEventWrapper[];
}

interface InternalState {
  chainId: number;
  currentCycleStart: Date;
  currentAddress: string;
  intervalId: number;
}

interface Estimate {
  currentBalance: Money;
  remainingBalance: Money;
  streamingUntil?: Date;
  currentlyStreaming: boolean;
  paused: boolean;
}

interface EstimatesState {
  workstreams: { [wsId: string]: Estimate };
  totalBalance?: Money;
  earnedInCurrentCycle?: Money;
}

const INITIAL_WORKSTREAMS_STATE = {
  fetchStatus: {
    relevantStreamsFetched: false,
    relevantStreamsFetching: true
  },
  workstreams: {}
};

export const workstreamsStore = (() => {
  const workstreams = writable<WorkstreamsState>(INITIAL_WORKSTREAMS_STATE);
  const estimates = writable<EstimatesState>({
    workstreams: {}
  });
  const internal = writable<InternalState | undefined>();

  function clear() {
    tick.deregister(get(internal).intervalId);

    workstreams.set(INITIAL_WORKSTREAMS_STATE);
    estimates.set({ workstreams: {} });
    internal.set(undefined);
  }

  /**
   * Connect the store to the chain in order to enable on-chain enrichment
   * and balance estimates for active workstreams.
   */
  async function connect(address: string, chainId: number, cycle: Cycle) {
    if (get(internal)) return;

    internal.set({
      chainId,
      currentCycleStart: cycle.start,
      currentAddress: address,
      intervalId: tick.register(estimateBalances)
    });

    await refreshRelevantStreams();
  }

  async function refreshRelevantStreams() {
    workstreams.update((v) => ({
      ...v,
      fetchStatus: {
        relevantStreamsFetching: true,
        relevantStreamsFetched: v.fetchStatus.relevantStreamsFetched
      }
    }));

    try {
      const { currentAddress, chainId } = get(internal);
      await fetchRelevantWorkstreams(currentAddress, chainId);

      workstreams.update((v) => ({
        ...v,
        fetchStatus: {
          relevantStreamsFetching: false,
          relevantStreamsFetched: true
        }
      }));
    } catch {
      workstreams.update((v) => ({
        ...v,
        fetchStatus: {
          relevantStreamsFetching: false,
          relevantStreamsFetched: 'error'
        }
      }));
    }
  }

  async function enrich(item: Workstream): Promise<EnrichedWorkstream> {
    const internalState = get(internal);

    // User isn't logged in, so no need to enrich with on-chain data.
    if (!internalState)
      return {
        data: item,
        relevant: false,
        fetchedAt: new Date()
      };

    const relevant =
      item.creator === internalState.currentAddress ||
      item.acceptedApplication === internalState.currentAddress;
    const direction =
      relevant && item.creator === internalState.currentAddress
        ? 'outgoing'
        : 'incoming';

    if (item.state !== WorkstreamState.ACTIVE)
      return {
        data: item,
        fetchedAt: new Date(),
        relevant,
        direction
      };

    const { id, creator, acceptedApplication: assignee, dripsData } = item;

    if (!dripsData) throw new Error(`No drips data for ws ${id}`);

    const { chainId } = get(internal);

    const [dripsAccount, dripsUpdatedEvents] = await Promise.all([
      getDripsAccount(creator, dripsData.accountId, chainId),
      getDripsUpdatedEvents(creator, dripsData.accountId)
    ]);

    if ([dripsAccount, dripsUpdatedEvents].find((v) => !v)) {
      throw new Error(`Unable to query on-chain state for workstream ${id}`);
    }

    const receiverConfig = dripsUpdatedEvents[
      dripsUpdatedEvents.length - 1
    ]?.event.args.receivers.find((r) => r.receiver.toLowerCase() === assignee);

    const amtPerSec = {
      wei: receiverConfig?.amtPerSec.toBigInt() || BigInt(0),
      currency: Currency.DAI
    };

    return {
      data: item,
      fetchedAt: new Date(),
      onChainData: {
        amtPerSec,
        dripsUpdatedEvents: dripsUpdatedEvents,
        dripsEntries: dripsAccount?.dripsEntries || [],
        streamSetUp: Boolean(
          dripsUpdatedEvents[0]?.event.args.receivers.find(
            (r) => r.receiver.toLowerCase() === item.acceptedApplication
          )
        ),
        dripsAccount: dripsAccount
      },
      relevant,
      direction
    };
  }

  function estimateBalances() {
    const ws = get(workstreams).workstreams;

    const newEstimates: { [wsId: string]: Estimate } = {};

    for (const [wsId, v] of Object.entries(ws)) {
      if (!v.onChainData) continue;

      const { dripsUpdatedEvents } = v.onChainData;

      if (dripsUpdatedEvents.length === 0) {
        // Drip hasn't yet been set up for this workstream.

        newEstimates[wsId] = {
          currentBalance: {
            wei: BigInt(0),
            currency: Currency.DAI
          },
          remainingBalance: {
            wei: BigInt(0),
            currency: Currency.DAI
          },
          streamingUntil: undefined,
          currentlyStreaming: false,
          paused: false
        };

        continue;
      }

      const streamed = streamedBetween([v])[0];

      const lastUpdate = dripsUpdatedEvents[dripsUpdatedEvents.length - 1];
      const currAmtPerSec =
        lastUpdate.event.args.receivers[0]?.amtPerSec.toBigInt() || BigInt(0);
      const lastUpdateTimestamp = lastUpdate.fromBlock.timestamp * 1000;
      const streamingUntil = currAmtPerSec
        ? new Date(
            lastUpdateTimestamp +
              Number(lastUpdate.event.args.balance.toBigInt() / currAmtPerSec) *
                1000
          )
        : undefined;

      newEstimates[wsId] = {
        currentBalance: streamed.amount,
        remainingBalance: streamed.remaining,
        streamingUntil,
        currentlyStreaming: streamingUntil
          ? streamingUntil.getTime() > new Date().getTime()
          : false,
        paused: currAmtPerSec === BigInt(0)
      };
    }

    /*
      Sum up the amount earned from all active streams in the store to
      calculcate the global earned amount.
    */
    const incomingWorkstreams = Object.values(ws).filter(
      (ws) => ws.direction === 'incoming'
    );
    const amountsStreamedTotal = streamedBetween(incomingWorkstreams);
    const amountsStreamedInCurrentCycle = streamedBetween(incomingWorkstreams, {
      from: get(internal).currentCycleStart,
      to: new Date()
    });

    const totalWeiEarned = amountsStreamedTotal.reduce<bigint>(
      (acc, v) => acc + v.amount.wei,
      BigInt(0)
    );
    const totalWeiEarnedInCurrentCycle =
      amountsStreamedInCurrentCycle.reduce<bigint>(
        (acc, v) => acc + v.amount.wei,
        BigInt(0)
      );

    estimates.update((estimatesVal) => ({
      totalBalance: {
        currency: Currency.DAI,
        wei: totalWeiEarned
      },
      earnedInCurrentCycle: {
        currency: Currency.DAI,
        wei: totalWeiEarnedInCurrentCycle
      },
      workstreams: {
        ...estimatesVal.workstreams,
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

      return { ...v, workstreams: { ...v.workstreams, ...toAppend } };
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

  async function getWorkstream(
    id: string,
    fetcher?: typeof fetch,
    bypassCache?: true
  ) {
    if (!bypassCache && serveFromCache(id)) return serveFromCache(id);

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
    refreshRelevantStreams,
    clear,
    getWorkstreams,
    getWorkstream
  };
})();
