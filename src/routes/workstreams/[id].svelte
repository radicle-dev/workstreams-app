<script context="module" lang="ts">
	import type { Workstream } from '$lib/stores/workstreams/types';

    /** @type {import('./[slug]').Load} */
	export async function load({ params, fetch }) {
		const url = `http://127.0.0.1:5001/radicle-workstreams/us-central1/api/workstreams/${params.id}`;
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
