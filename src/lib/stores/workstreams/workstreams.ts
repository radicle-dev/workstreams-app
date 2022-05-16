import { writable } from 'svelte/store';
import type {
  Workstream,
  WorkstreamState
} from '$lib/stores/workstreams/types';
import { getConfig } from '$lib/config';

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

export const workstreamsStore = (() => {
  const { subscribe } = writable<Workstream[]>([]);

  // TODO: caching

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
    const url = `${getConfig().API_URL_BASE}/workstreams/${id}`;
    const response = await _fetch(url, undefined, fetcher);

    if (response.ok) {
      const parsed = JSON.parse(await response.text(), reviver) as Workstream;
      return {
        data: parsed,
        ok: true
      };
    } else {
      return {
        ok: false,
        error: await response.json()
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
      return {
        ok: true
      };
    } else {
      return {
        ok: false,
        error: await response.json()
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
    subscribe,
    getWorkstreams,
    getWorkstream,
    activateWorkstream
  };
})();
