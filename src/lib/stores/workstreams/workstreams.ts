import { get, writable } from 'svelte/store';
import {
  Currency,
  WorkstreamState,
  type Money,
  type Workstream
} from '$lib/stores/workstreams/types';
import { getConfig } from '$lib/config';
import query from '$lib/api';
import type {
  DripsConfig_dripsConfig_dripsAccount,
  DripsConfig_dripsConfig_dripsEntries
} from '$lib/api/__generated__/dripsConfig';
import { GET_DRIPS_ACCOUNT } from '$lib/api/queries';
import { walletStore } from '../wallet/wallet';
import type {
  DripsAccount,
  DripsAccountVariables
} from '$lib/api/__generated__/DripsAccount';
import connectedAndLoggedIn from '../connectedAndLoggedIn';

const reviver: (key: string, value: unknown) => unknown = (key, value) => {
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

export interface OnChainData {
  amtPerSec: Money;
  dripsEntries: DripsConfig_dripsConfig_dripsEntries[];
  dripsAccount: DripsConfig_dripsConfig_dripsAccount;
}

export const workstreamsStore = (() => {
  const store = writable<WorkstreamsState>({});

  async function clear() {
    store.set({});
  }

  async function enrich(item: Workstream): Promise<EnrichedWorkstream> {
    const ws = get(walletStore);
    const loggedIn = get(connectedAndLoggedIn);

    if (
      item.state === WorkstreamState.ACTIVE &&
      loggedIn &&
      (ws.accounts[0] === item.creator ||
        ws.accounts[0] === item.acceptedApplication)
    ) {
      const { id, creator, acceptedApplication: assignee, dripsData } = item;

      if (!dripsData) throw new Error(`No drips data for ws ${id}`);

      const dripsAccount = (
        await query<DripsAccount, DripsAccountVariables>({
          query: GET_DRIPS_ACCOUNT,
          variables: {
            id: `${creator}-${dripsData.accountId}`
          },
          chainId: ws.chainId
        })
      ).dripsAccount;

      if (!dripsAccount) {
        throw new Error(`No drips account for active workstream ${id}}`);
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
          dripsEntries: dripsAccount.dripsEntries,
          dripsAccount: dripsAccount
        }
      };
    } else {
      return {
        data: item,
        fetchedAt: new Date()
      };
    }
  }

  async function pushState(enrichedWorkstreams: EnrichedWorkstream[]) {
    store.update((v) => {
      let toAppend: WorkstreamsState = {};

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
    const data = get(store)[id]?.data;

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
      store.update((v) => {
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
    subscribe: store.subscribe,
    clear,
    getWorkstreams,
    getWorkstream,
    activateWorkstream
  };
})();
