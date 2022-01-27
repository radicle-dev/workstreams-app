<script context="module">
	import { get } from 'svelte/store';
	import { workstreams } from '$lib/stores/workstreamsStore.js';
	import { hyphanateString } from '$lib/utils/format';
	const workstreamsData = get(workstreams);

	export async function load({ params }) {
		let workstream = workstreamsData.find(
			(workstream) => hyphanateString(workstream.title) === params.id
		);
		return { props: { workstream } };
	}
</script>

<script lang="ts">
	import Protected from '@components/Protected/index.svelte';
	import WorkstreamDetail from '@components/WorkstreamDetail/index.svelte';
	export let workstream;
</script>

<svelte:head>
	<title>Workstream</title>
</svelte:head>

<Protected>
	<WorkstreamDetail {workstream} />
</Protected>
