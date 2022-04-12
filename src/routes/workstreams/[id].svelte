<script context="module" lang="ts">
	import type { Workstream } from '$lib/stores/types';

    /** @type {import('./[slug]').Load} */
	export async function load({ params, fetch }) {
        console.log('FETCHING', `https://us-central1-radicle-workstreams.cloudfunctions.net/api/workstreams/${params.id}`);
		const url = `https://us-central1-radicle-workstreams.cloudfunctions.net/api/workstreams/${params.id}`;
        const response = await fetch(url);

		return {
            status: response.status,
            props: {
                workstream: response.ok && (await response.json())
            },
        };
	};
</script>

<script lang="ts">
	import WorkstreamDetail from '$components/WorkstreamDetail.svelte';

	export let workstream: Workstream;
</script>

<svelte:head>
	<title>Workstream</title>
</svelte:head>

{#if workstream}
	<WorkstreamDetail {workstream} />
{:else}
	<p>Sorry couldn't load the details of this workstream.</p>
{/if}
