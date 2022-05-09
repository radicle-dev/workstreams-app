import { writable } from 'svelte/store';
import type { Workstream } from '$lib/stores/workstreams/types';
import { getConfig } from '$lib/config';

const reviver: (key: string, value: unknown) => unknown = (key, value) => {
  let output = value;

  if (key === 'wei' && typeof value === 'string') {
    output = BigInt(value);
  }

  return output;
};

export const workstreamsStore = (() => {
  const { subscribe } = writable<Workstream[]>([]);

  // TODO: caching

  async function getWorkstreams(fetcher?: typeof fetch) {
    const url = `${getConfig().API_URL_BASE}/workstreams`;
    const response = await _fetch(fetcher, url);

    if (response.ok) {
      const parsed = JSON.parse(await response.text(), reviver) as Workstream[];
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

  async function getWorkstream(id: string, fetcher?: typeof fetch) {
    const url = `${getConfig().API_URL_BASE}/workstreams/${id}`;
    const response = await _fetch(fetcher, url);

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

  async function _fetch(fetcher?: typeof fetch, url: string) {
    return (fetcher || fetch)(url, { credentials: 'include' });
  }

  return {
    subscribe,
    getWorkstreams
  };
})();
