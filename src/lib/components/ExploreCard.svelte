<script lang="ts">
	import { goto } from '$app/navigation';
	import { hyphenateString } from '$lib/utils/format';
	import type { Workstream } from '$lib/stores/workstreams/types';

	import Card from '$components/Card.svelte';
	import Apply from '$components/icons/Ledger.svelte';
	import Button from '$components/Button.svelte';
	import TitleMeta from '$components/TitleMeta.svelte';
	import Rate from '$components/Rate.svelte';
	import Timeframe from '$components/Timeframe.svelte';

	export let workstream: Workstream;
</script>

<Card on:CardClick={() => goto(`/workstreams/${hyphenateString(workstream.id)}`)}>
	<div slot="top">
		<TitleMeta title={workstream.title} type={workstream.type} creator={workstream.creator} />
	</div>
	<div slot="bottom" class="spread">
		<div>
			{#if workstream.type === 'grant'}
				<Timeframe duration={workstream.length} />
			{/if}
			<Rate rate={workstream.payment_rate} currency={workstream.payment_currency} />
		</div>
		<Button variant="outline"><Apply />Apply</Button>
	</div>
</Card>

<style>
	.spread {
		display: flex;
		flex: 1;
		justify-content: space-between;
		align-items: flex-;
	}
</style>
