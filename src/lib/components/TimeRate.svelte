<script lang="ts">
	import type { Workstream } from '$lib/stores/workstreams/types';
	import { WorkstreamType } from '$lib/stores/workstreams/types';
	import Rate from '$components/Rate.svelte';
	import Timeframe from '$components/Timeframe.svelte';

	export let workstream: Workstream;
</script>

<div class="spread">
	<Rate rate={workstream.payment.rate} currency={workstream.payment.currency} />
	{#if workstream.type === WorkstreamType.GRANT && workstream.duration}
		<Timeframe duration={workstream.duration} />
	{/if}
</div>

<style>
	.spread {
		display: flex;
		flex: 1;
		justify-content: space-between;
		align-items: flex-end;
	}
</style>
