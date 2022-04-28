import { writable } from 'svelte/store';
import type { Workstream } from '$lib/stores/workstreams/types';

export const workstreamsStore = (() => {
  const store = writable<Workstream[]>([]);

  return {
    ...store
  };
})();
