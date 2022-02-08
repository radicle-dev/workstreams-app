<script context="module" lang="ts">
	import { get } from 'svelte/store';
	import { workstreamsStore } from '$lib/stores/workstreams';
	import { hyphanateString } from '$lib/utils/format';
	import type { Workstream } from '$lib/types';

	const workstreams: Workstream[] = get(workstreamsStore);

	/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
	export const load = async ({ params }): Promise<{ props: { workstream: Workstream } }> => {
		const workstream = workstreams.find(
			(workstream) => hyphanateString(workstream.title) === params.title
		);
		return { props: { workstream } };
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
