import { get, writable } from 'svelte/store';
import { CID } from 'multiformats/cid';
import { z } from 'zod';

import query from '$lib/api/drips-subgraph';
import {
  DRIPS_ACCOUNTS_FOR_USER,
  DRIPS_ENTRIES_STREAMING_TO_USER
} from '$lib/api/drips-subgraph/queries';
import { base10toCid, cidToBase10 } from '$lib/utils/cid';
import type { Cycle } from '../drips';
import tick from '../tick';
import getDripsUpdatedEvents from './methods/getDripsUpdatedEvents';
import buildDripHistory from './methods/buildDripHistory';
import { streamedBetween } from '../drips/utils/streamedBetween';
import type {
  DripsEntriesStreamingToUser,
  DripsEntriesStreamingToUserVariables
} from '$lib/api/drips-subgraph/__generated__/DripsEntriesStreamingToUser';
import type {
  DripsAccountsForUser,
  DripsAccountsForUserVariables
} from '$lib/api/drips-subgraph/__generated__/DripsAccountsForUser';

const IPFS_GATEWAY_DOMAIN = 'drips.mypinata.cloud';

const dateSchema = z.preprocess((arg) => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
}, z.date());

const bigintSchema = z.preprocess((arg) => {
  if (typeof arg == 'string' || typeof arg == 'number') return BigInt(arg);
}, z.bigint());

const currencySchema = z.enum(['dai']);
export type Currency = z.infer<typeof currencySchema>;

const Money = z.object({
  currency: currencySchema,
  wei: bigintSchema
});
export type Money = z.infer<typeof Money>;

const Workstream = z.object({
  creator: z.string(),
  receiver: z.string(),
  createdAt: dateSchema,
  description: z.string(),
  title: z.string(),
  streamTarget: Money,
  amountPerSecond: Money
});
export type Workstream = z.infer<typeof Workstream>;

export interface DripHistoryEvent {
  balance: Money;
  amtPerSec: Money;
  timestamp: Date;
}

interface OnChainData {
  amtPerSec: Money;
  dripHistory: DripHistoryEvent[];
  currentlyStreaming: boolean;
  paused: boolean;
}

interface Estimate {
  currentBalance: Money;
  remainingBalance: Money;
  streamingUntil?: Date;
}

export interface EnrichedWorkstream {
  cid: string;
  data: Workstream;
  fetchedAt: Date;
  direction?: 'incoming' | 'outgoing';
  onChainData: OnChainData;
  relevant: boolean;
  estimate?: Estimate;
}

interface WorkstreamsState {
  fetched: boolean;
  earnedInCurrentCycle?: Money;
  totalEarned?: Money;
  workstreams: { [workstreamId: string]: EnrichedWorkstream };
}

interface InternalState {
  chainId: number;
  currentCycleStart: Date;
  currentAddress: string;
  intervalId: number;
}

const INITIAL_WORKSTREAMS_STATE: WorkstreamsState = {
  fetched: false,
  workstreams: {}
};

export default (() => {
  const workstreams = writable<WorkstreamsState>(INITIAL_WORKSTREAMS_STATE);
  const internal = writable<InternalState | undefined>();

  /**
   * Connect the store with the user's wallet. This triggers fetching of all
   * relevant Workstreams associated with the user, and starts estimations for
   * current balances, updated once per second.
   *
   * @param address The user's current wallet address.
   * @param chainId Canonical chainId for the currently selected chain.
   * @param cycle Information about the current Radicle Drips cycle.
   */
  async function connect(address: string, chainId: number, cycle: Cycle) {
    if (get(internal)) return;

    internal.set({
      chainId,
      currentCycleStart: cycle.start,
      currentAddress: address,
      intervalId: tick.register(_estimateBalances)
    });

    await _fetchWorkstreams();
  }

  /**
   * Disconnect the store from the user's wallet. Clears the store completely
   * and stops estimation logic.
   */
  function disconnect() {
    const { intervalId } = get(internal) ?? {};
    if (intervalId) tick.deregister(intervalId);

    internal.set(undefined);
    workstreams.set(INITIAL_WORKSTREAMS_STATE);
  }

  /**
   * Pins a new Workstream to IPFS. Please note that the stream needs to be set
   * up on-chain via `drips.createDrip` before it gets returned in listing calls.
   *
   * @param workstream The Workstream object to pin to IPFS.
   * @return The CID of the newly-created Workstream.
   */
  async function createWorkstream(workstream: Workstream): Promise<CID> {
    const res = await fetch('/api/ipfs/pin', {
      method: 'POST',
      body: JSON.stringify(workstream, (_, value) => {
        if (typeof value === 'bigint') {
          return String(value);
        }
        return value;
      })
    });

    return CID.parse(await res.text());
  }

  /**
   * Fetches and returns a singular enriched Workstream, and appends it to the
   * store state. If the Workstream could not be found or wasn't set up on-chain,
   * an error is thrown.
   *
   * @param id The IPFS CIDv0 for the Workstream.
   * @return The requested Workstream object with enriched on-chain data.
   */
  async function fetchWorkstream(id: string): Promise<EnrichedWorkstream> {
    const cid = CID.parse(id);

    if (cid.version !== 0) {
      throw new Error('Workstream CID must be v0');
    }

    const res = await _ipfs(cid);
    const workstream = Workstream.parse(await res.json());
    const enriched = await _enrichWorkstream(cid.toString(), workstream);

    _pushWorkstreams(enriched);

    return enriched;
  }

  /**
   * Take a Workstream payload from IPFS and fetch on-chain data to
   * construct an EnrichedWorkstream object.
   * @private
   */
  async function _enrichWorkstream(
    cid: string,
    workstream: Workstream
  ): Promise<EnrichedWorkstream> {
    const internalState = get(internal);

    if (!internalState) {
      throw new Error('Log in first');
    }

    const { creator, receiver } = workstream;

    const relevant =
      creator === internalState.currentAddress ||
      receiver === internalState.currentAddress;

    const direction =
      relevant && creator === internalState.currentAddress
        ? 'outgoing'
        : 'incoming';

    const updateEvents = await getDripsUpdatedEvents(
      creator,
      BigInt(cidToBase10(CID.parse(cid)))
    );

    if (updateEvents.length === 0) {
      throw new Error(
        'Provided workstream CID has no associated Drips subaccount'
      );
    }

    const dripHistory = buildDripHistory(updateEvents, receiver);

    const amtPerSec: Money = {
      wei: dripHistory[dripHistory.length - 1].amtPerSec.wei,
      currency: 'dai'
    };

    return {
      cid,
      data: workstream,
      fetchedAt: new Date(),
      onChainData: {
        amtPerSec,
        dripHistory,
        currentlyStreaming: amtPerSec.wei > BigInt(0),
        paused: amtPerSec.wei === BigInt(0)
      },
      direction,
      relevant
    };
  }

  /**
   * Update the estimate of remaining and streamed amounts for
   * each Workstream stored in the store state.
   * @private
   */
  async function _estimateBalances() {
    const ws = get(workstreams).workstreams;

    const i = get(internal);
    if (!i) throw new Error('Connect store first');

    // Update all individual stream estimates

    const streamed = streamedBetween(Object.values(ws));

    for (const estimate of streamed) {
      const { wei: weiPerSec } = estimate.workstream.onChainData.amtPerSec;

      const streamingForAnotherMillis =
        (weiPerSec > BigInt(0) &&
          Number(estimate.remaining.wei / weiPerSec) * 1000) ||
        undefined;

      const streamingUntil =
        (streamingForAnotherMillis &&
          new Date(new Date().getTime() + streamingForAnotherMillis)) ||
        undefined;

      workstreams.update((ws) => ({
        ...ws,
        workstreams: {
          ...ws.workstreams,
          [estimate.workstream.cid]: {
            ...ws.workstreams[estimate.workstream.cid],
            estimate: {
              currentBalance: estimate.amount,
              remainingBalance: estimate.remaining,
              streamingUntil
            }
          }
        }
      }));
    }

    // Update total estimations

    const streamedInCurrentCycle = streamedBetween(Object.values(ws), {
      from: i.currentCycleStart,
      to: new Date()
    });

    workstreams.update((ws) => ({
      ...ws,
      earnedInCurrentCycle: {
        currency: 'dai',
        wei: streamedInCurrentCycle
          .filter((e) => e.workstream.direction === 'incoming')
          .reduce<bigint>((acc, v) => acc + v.amount.wei, BigInt(0))
      },
      totalEarned: {
        currency: 'dai',
        wei: streamed
          .filter((e) => e.workstream.direction === 'incoming')
          .reduce<bigint>((acc, v) => acc + v.amount.wei, BigInt(0))
      }
    }));
  }

  /**
   * Fetch all Workstreams created by the current user and populate
   * the store.
   * @private
   *
   * TODO: Also fetch workstreams assigned to the current user.
   */
  async function _fetchWorkstreams() {
    const { currentAddress, chainId } = get(internal) ?? {};

    if (!currentAddress || !chainId) throw new Error('Not connected to wallet');

    const dripsAccounts = (
      await query<DripsAccountsForUser, DripsAccountsForUserVariables>({
        query: DRIPS_ACCOUNTS_FOR_USER,
        chainId,
        variables: {
          user: currentAddress
        }
      })
    ).dripsConfig?.dripsAccount;
    const dripsAccountIds =
      dripsAccounts?.map((da) => da.account as string) ?? [];

    const incomingEntries =
      (
        await query<
          DripsEntriesStreamingToUser,
          DripsEntriesStreamingToUserVariables
        >({
          query: DRIPS_ENTRIES_STREAMING_TO_USER,
          chainId,
          variables: {
            user: currentAddress
          }
        })
      ).dripsEntries ?? [];
    const incomingAccountEntries = incomingEntries.filter(
      (de) => de.isAccountDrip
    );

    const incomingAccountIds = incomingAccountEntries.reduce<string[]>(
      (acc, curr) => {
        if (!acc.includes(curr.account)) return [...acc, curr.account];
        return acc;
      },
      []
    );

    const ipfsFetches = [...dripsAccountIds, ...incomingAccountIds].map(
      async (da) => {
        try {
          const cid = base10toCid(da).toString();
          const enrichedWorkstream = await fetchWorkstream(cid);

          _pushWorkstreams(enrichedWorkstream);
        } catch (e) {
          return undefined;
        }
      }
    );

    Promise.allSettled(ipfsFetches);
  }

  /**
   * Append one or more EnrichedWorkstreams object to the store
   * state.
   * @private
   */
  function _pushWorkstreams(...args: EnrichedWorkstream[]) {
    args.forEach((enrichedWorkstream) =>
      workstreams.update((s) => ({
        fetched: true,
        workstreams: {
          ...s.workstreams,
          [enrichedWorkstream.cid]: enrichedWorkstream
        }
      }))
    );
  }

  /**
   * Fetch a Workstream object from IPFS by its CID.
   * @private
   */
  function _ipfs(cid: CID) {
    return fetch(`https://${IPFS_GATEWAY_DOMAIN}/ipfs/${cid.toString()}`);
  }

  return {
    subscribe: workstreams.subscribe,
    connect,
    disconnect,
    createWorkstream,
    fetchWorkstream
  };
})();
