import { writable } from 'svelte/store';
import type { Workstream } from '$lib/stores/types';

function createStore() {
	const store = writable<Workstream[]>([]);

	return {
		...store,
	}
}

export default createStore();