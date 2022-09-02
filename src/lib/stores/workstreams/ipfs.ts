import { get, writable } from 'svelte/store';
import { CID } from 'multiformats/cid';
import { z } from 'zod';

import query from '$lib/api/drips-subgraph';
import { DRIPS_ENTRIES_FOR_CONFIG } from '$lib/api/drips-subgraph/queries';
import type {
  DripsEntriesForConfig,
  DripsEntriesForConfigVariables
} from '$lib/api/drips-subgraph/__generated__/DripsEntriesForConfig';
import { base10toCid, cidToBase10 } from '$lib/utils/cid';
import type { Cycle } from '../drips';
import tick from '../tick';
import getDripsUpdatedEvents from './methods/getDripsUpdatedEvents';
import buildDripHistory from './methods/buildDripHistory';

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

interface EnrichedWorkstream {
  cid: string;
  data: Workstream;
  fetchedAt: Date;
  direction?: 'incoming' | 'outgoing';
  onChainData?: OnChainData;
  estimate?: Estimate;
}

interface WorkstreamsState {
  fetched: boolean;
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
   * Pins a new Workstream to IPFS. Please note that the stream needs to be set
   * up on-chain via `drips.createDrip` before it gets returned in listing calls.
   *
   * @param workstream The Workstream object to pin to IPFS.
   * @return The CID of the newly-created Workstream.
   */
  async function createWorkstream(workstream: Workstream): Promise<CID> {
    const res = await fetch('/api/ipfs/pin', {
      method: 'POST',
      body: JSON.stringify(workstream, (key, value) => {
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
      return {
        cid,
        data: workstream,
        fetchedAt: new Date()
      };
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
      direction
    };
  }

  /**
   * Update the estimate of remaining and streamed amounts for
   * each Workstream stored in the store state.
   * @private
   */
  async function _estimateBalances() {
    // TODO
  }

  /**
   * Fetch all Workstreams created by the current user and populate
   * the store.
   * @private
   *
   * TODO: Also fetch workstreams assigned to the current user.
   */
  async function _fetchWorkstreams() {
    const { currentAddress, chainId } = get(internal);

    if (!currentAddress || !chainId) throw new Error('Not connected to wallet');

    const dripsConfig = await query<
      DripsEntriesForConfig,
      DripsEntriesForConfigVariables
    >({
      query: DRIPS_ENTRIES_FOR_CONFIG,
      chainId,
      variables: {
        user: currentAddress
      }
    });

    const dripsEntries = dripsConfig.dripsConfig?.dripsEntries;
    if (!dripsEntries) return;

    const accountDrips = dripsEntries.filter((de) => de.isAccountDrip);

    const dripsAccounts = accountDrips.reduce<string[]>((acc, curr) => {
      if (!acc.includes(curr.account)) return [...acc, curr.account];
      return acc;
    }, []);

    const ipfsFetches = dripsAccounts.map(async (da) => {
      try {
        const cid = base10toCid(da).toString();
        const enrichedWorkstream = await fetchWorkstream(cid);

        _pushWorkstreams(enrichedWorkstream);
      } catch (e) {
        return undefined;
      }
    });

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
        fetched: s.fetched,
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
    connect,
    createWorkstream,
    fetchWorkstream
  };
})();
