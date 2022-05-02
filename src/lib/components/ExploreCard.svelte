<script lang="ts">
	import { goto, prefetch } from '$app/navigation';
	import { hyphenateString } from '$lib/utils/format';
	import type { Workstream } from '$lib/stores/workstreams/types';

	import Card from '$components/Card.svelte';
	import TitleMeta from '$components/TitleMeta.svelte';
	import TimeRate from '$components/TimeRate.svelte';

	export let workstream: Workstream;

	$: url = `/workstream/${hyphenateString(workstream.id)}`;
</script>

<Card on:click={() => goto(url)} on:hover={() => prefetch(url)}>
	<div slot="top">
		<TitleMeta {workstream} />
	</div>
	<div slot="bottom">
		<TimeRate {workstream} />
	</div>
</Card>
