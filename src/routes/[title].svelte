<script context="module" lang="ts">
	import { get } from 'svelte/store';
	import { workstreams } from '$lib/stores/workstreams';
	import { hyphanateString } from '$lib/utils/format';
	import type { Workstream } from '$lib/types';

	const streams: Workstream[] = get(workstreams);

	export const load = async ({ params }): Promise<{ props: { workstream: Workstream } }> => {
		const workstream = streams.find((workstream) => hyphanateString(workstream.title) === params.title);
		return { props: { workstream } };
	};
</script>

<script lang="ts">
	import WorkstreamDetail from '$lib/components/WorkstreamDetail.svelte';

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
