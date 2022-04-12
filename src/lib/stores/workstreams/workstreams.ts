import { writable } from 'svelte/store';
import type { Workstream } from '$lib/stores/workstreams/types';

function createStore() {
	const store = writable<Workstream[]>([]);

	return {
		...store,
	}
}

export default createStore();