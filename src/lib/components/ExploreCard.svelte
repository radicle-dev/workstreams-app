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

	export let data: Workstream;
</script>

<Card on:CardClick={() => goto(`/${hyphanateString(data.title)}`)}>
	<div slot="top">
		<TitleMeta title={data.title} type={data.type} creator={data.creator} />
	</div>
	<div slot="bottom" class="spread">
		<div>
			{#if data.type === 'grant'}
				<Timeframe starting={data.starting_at} ending={data.ending_at} />
			{/if}
			<Rate rate={data.payment_rate} currency={data.payment_currency} />
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
