<script lang="ts">
	import { goto } from '$app/navigation';
	import { timeframeFormat, startDateFormat, hyphanateString } from '$lib/utils/format';
	import User from '$components/User.svelte';
	import Tag from '$components/Tag.svelte';
	import type { Workstream } from '$lib/types';

	export let data: Workstream;
</script>

<div on:click={() => goto(`/${hyphanateString(data.title)}`)} class="row">
	<div class="left">
		<div class="title">
			<User address={data.creator} showAddress={false} />
			<h4 style="margin: 0 0.75rem;">{data.title}</h4>
			<Tag>{data.type}</Tag>
		</div>
	</div>
	<div class="right">
		{#if data.type === 'grant'}
			<p class="timeframe">{timeframeFormat(data.starting_at, data.ending_at)}</p>
		{:else if data.type === 'role'}
			<p class="timeframe">Start {startDateFormat(data.starting_at)}</p>
		{/if}
		<p class="typo-text-bold rate">
			{Math.floor(data.payment_rate * 60 * 60 * 24)}
			{data.payment_currency} <span class="typo-regular">/ day</span>
		</p>
	</div>
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;
		padding: 1.5rem;
		border-left: 1px solid var(--color-primary-level-6);
		border-right: 1px solid var(--color-primary-level-6);
		border-top: 1px solid var(--color-primary-level-6);
		cursor: pointer;
		justify-content: space-between;
	}
	.row:hover {
		box-shadow: 0 0 1rem var(--color-primary-level-6);
	}
	.row:first-child {
		border-top-left-radius: 0.25rem;
		border-top-right-radius: 0.25rem;
	}
	.row:last-child {
		border-bottom-left-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
		border-bottom: 1px solid var(--color-primary-level-6);
	}
	.left > * {
		margin-bottom: 1.5rem;
	}
	.title {
		display: flex;
		align-items: center;
	}
	.title {
		margin-bottom: 0.25rem;
	}
	.right {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	.timeframe {
		color: var(--color-foreground-level-5);
	}
	.rate {
		color: var(--color-primary);
	}
</style>
