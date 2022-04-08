<script lang="ts">
	import { goto } from '$app/navigation';
	import { hyphanateString } from '$lib/utils/format';
	import type { Workstream } from '$lib/types';

	import Card from '$components/Card.svelte';
	import Apply from '$components/icons/Ledger.svelte';
	import Button from '$components/Button.svelte';
	import TitleMeta from '$components/TitleMeta.svelte';
	import Rate from '$components/Rate.svelte';
	import Timeframe from '$components/Timeframe.svelte';
	import ActionRow from '$components/ActionRow.svelte';

	export let workstream: Workstream;
</script>

<Card on:CardClick={() => goto(`/${hyphanateString(workstream.title)}`)}>
	<div slot="top">
		<TitleMeta title={workstream.title} type={workstream.type} creator={workstream.creator} />
	</div>
	<div slot="bottom" class="content">
		<div class="spread">
			<Rate rate={workstream.payment_rate} currency={workstream.payment_currency} />
			{#if workstream.type === 'grant'}
				<Timeframe starting={workstream.starting_at} ending={workstream.ending_at} />
			{/if}
		</div>
		<Button
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
