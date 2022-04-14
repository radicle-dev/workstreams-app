<script lang="ts">
	import { goto, prefetch } from '$app/navigation';
	import { hyphenateString } from '$lib/utils/format';
	import type { Workstream } from '$lib/stores/workstreams/types';

	import Card from '$components/Card.svelte';
	import Apply from '$components/icons/Ledger.svelte';
	import Button from '$components/Button.svelte';
	import TitleMeta from '$components/TitleMeta.svelte';
	import Rate from '$components/Rate.svelte';
	import Timeframe from '$components/Timeframe.svelte';

	export let workstream: Workstream;

	$: url = `/workstreams/${hyphenateString(workstream.id)}`;
</script>

<Card
	on:click={() => goto(url)}
	on:hover={() => prefetch(url)}
>
	<div slot="top">
		<TitleMeta title={workstream.title} type={workstream.type} creator={workstream.creator} />
	</div>
	<div slot="bottom" class="spread">
		<div>
			{#if workstream.type === 'grant' && workstream.duration}
				<Timeframe duration={workstream.duration} />
			{/if}
			<Rate rate={workstream.payment.rate} currency={workstream.payment.currency} />
		</div>
		<Button variant="outline"><Apply />Apply</Button>
	</div>
</Card>

<style>
	.spread {
		display: flex;
		flex: 1;
		justify-content: space-between;
		align-items: flex-end;
	}

	a {
		all: unset;
	}
</style>
