import { get, writable } from 'svelte/store';
import {
  WorkstreamState,
  type Workstream
} from '$lib/stores/workstreams/types';
import { getConfig } from '$lib/config';
import { browser } from '$app/env';

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
  [workstreamId: string]: {
    fetchedAt: Date;
    data: Workstream;
  };
}

export const workstreamsStore = (() => {
  const store = writable<WorkstreamsState>({});

  async function pushState(workstreams: Workstream[]) {
    store.update((v) => {
      let toAppend: WorkstreamsState = {};

      for (const workstream of workstreams) {
        if (Object.keys(v).find((k) => k === workstream.id)) {
          continue;
        }

        toAppend = {
          ...toAppend,
          [workstream.id]: {
            fetchedAt: new Date(),
            data: workstream
          }
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

      pushState(parsed);

      return {
        data: parsed,
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

      pushState([parsed]);

      return {
        data: parsed,
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
    getWorkstreams,
    getWorkstream,
    activateWorkstream
  };
})();
