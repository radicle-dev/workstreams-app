<script lang="ts">
	import { goto } from '$app/navigation';
	import User from '$components/User.svelte';
	import Tag from '$components/Tag.svelte';
	import { timeframeFormat, startDateFormat, hyphenateString } from '$lib/utils/format';
	import type { Workstream } from '$lib/stores/types';

	export let data: Workstream;
</script>

<div on:click={() => goto(`/workstreams/${hyphenateString(data.id)}`)} class="card">
	<div class="top">
		<div class="title">
			<h4 style="margin-right: 0.75rem;" class="typo-overflow-ellipsis">{data.title}</h4>
			<Tag>{data.type}</Tag>
		</div>
		<div class="owner">
			<span>by</span>
			<User address={data.creator} />
		</div>
		<p class="desc">{data.desc}</p>
	</div>
	<div class="bottom">
		{#if data.type === 'grant' && data.length}
			<p class="timeframe">{timeframeFormat(data.length)}</p>
		{/if}
		<p class="typo-text-bold rate">
			{Math.floor(data.payment_rate * 60 * 60 * 24)}
			{data.payment_currency} <span class="typo-regular">/ day</span>
		</p>
	</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		border: 1px solid var(--color-pink-dark);
		border-radius: 0.25rem;
		cursor: pointer;
		justify-content: space-between;
	}
	.card:hover {
		border: 1px solid var(--color-pink);
		box-shadow: 0 0 1rem var(--color-pink-dark);
	}
	.top > * {
		margin-bottom: 1.5rem;
	}
	.title,
	.owner {
		display: flex;
		align-items: center;
	}
	.title {
		margin-bottom: 0.25rem;
	}
	.owner > span {
		color: var(--color-grey-darker);
		margin-right: 0.5rem;
	}
	.desc {
		color: var(--color-grey);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.bottom {
		display: flex;
		justify-content: space-between;
	}
	.timeframe {
		color: var(--color-grey-dark);
	}
	.rate {
		color: var(--color-pink);
	}
</style>
