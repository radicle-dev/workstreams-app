<script lang="ts">
	import { goto } from '$app/navigation';
	import { timeframeFormat, startDateFormat, hyphanateString } from '$lib/utils/format';
	import Tag from '$lib/shared/Tag.svelte';
	import User from '$lib/shared/User.svelte';

	export let data;
</script>

<div on:click={() => goto(`/${hyphanateString(data.title)}`)} class="row">
	<div class="left">
		<div class="title">
			<User address={data.creator} showAddress={false} />
			<h4>{data.title}</h4>
			<Tag>{data.type}</Tag>
		</div>
	</div>
	<div class="right">
		{#if data.type === 'grant'}
			<p class="timeframe">{timeframeFormat(data.starting_at, data.ending_at)}</p>
		{:else if data.type === 'role'}
			<p class="timeframe">Start {startDateFormat(data.startin_at)}</p>
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
		border-left: 1px solid var(--color-blue-dark);
		border-right: 1px solid var(--color-blue-dark);
		border-top: 1px solid var(--color-blue-dark);
		cursor: pointer;
		justify-content: space-between;
	}
	.row:hover {
		box-shadow: 0 0 1rem var(--color-blue-dark);
	}

	.row:first-child {
		border-top-left-radius: 0.25rem;
		border-top-right-radius: 0.25rem;
	}

	.row:last-child {
		border-bottom-left-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
		border-bottom: 1px solid var(--color-blue-dark);
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
		color: var(--color-grey-dark);
	}

	.rate {
		color: var(--color-blue);
	}
</style>
