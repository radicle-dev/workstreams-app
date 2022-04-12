import { writable } from 'svelte/store';
import type { Workstream } from '$lib/types';

export default function createStore() {
	const { subscribe, set } = writable<Workstream[]>();

	async function refresh() {
		const fetched = await fetch('https://us-central1-radicle-workstreams.cloudfunctions.net/api/workstreams');
		const result = await fetched.json();

		set(result as Workstream[]);
	}

	return {
		subscribe
	}
}
