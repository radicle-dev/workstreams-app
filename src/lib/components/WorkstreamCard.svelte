<script lang="ts">
	import { goto, prefetch } from '$app/navigation';
	import { hyphenateString } from '$lib/utils/format';
	import type { Workstream } from '$lib/stores/workstreams/types';

	import Card from '$components/Card.svelte';
	import Button from '$components/Button.svelte';
	import TitleMeta from '$components/TitleMeta.svelte';
	import Rate from '$components/Rate.svelte';
	import Timeframe from '$components/Timeframe.svelte';
	import ActionRow from '$components/ActionRow.svelte';

	export let workstream: Workstream;

	$: url = `/explore/${hyphenateString(workstream.id)}`;
</script>

<Card>
	<div slot="top">
		<TitleMeta title={workstream.title} type={workstream.type} creator={workstream.creator} />
	</div>
	<div slot="bottom" class="content">
		<div class="spread">
			<Rate rate={workstream.payment.rate} currency={workstream.payment.currency} />
			{#if workstream.type === 'grant'}
				<Timeframe duration={workstream.duration} />
			{/if}
		</div>
		<Button
			on:click={() => goto(url)}
			on:hover={() => prefetch(url)}
			style="margin-top: 1rem; width: 100%; display: block; text-align: center;"
			variant="outline">View workstream details</Button
		>
		<ActionRow {workstream} />
	</div>
</Card>

<style>
	.content {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.spread {
		display: flex;
		justify-content: space-between;
	}
</style>
