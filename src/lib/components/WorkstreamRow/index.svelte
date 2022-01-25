<script lang="ts">
	import { goto } from '$app/navigation';
	import { timeframeFormat, startDateFormat } from '$lib/utils/format';
	import Tag from '../../shared/Tag.svelte';
	import User from '../../shared/User.svelte';

	export let data;
</script>

<div on:click={() => goto(`/${data.title}`)} class="row">
	<div class="left">
		<div class="title">
			<User address={data.owner} showAddress={false} />
			<h4>{data.title}</h4>
			<Tag>{data.type}</Tag>
		</div>
	</div>
	<div class="right">
		{#if data.type === 'grant'}
			<p class="timeframe">{timeframeFormat(data.timeframe)}</p>
		{:else if data.type === 'role'}
			<p class="timeframe">Start {startDateFormat(data.start_date)}</p>
		{/if}
		<p class="typo-text-bold rate">
			{Math.floor(data.rate * 60 * 60 * 24)}
			{data.currency} <span class="typo-regular">/ day</span>
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
		border-radius: 0.25rem 0.25rem 0 0;
	}

	.row:last-child {
		border-radius: 0 0 0.25rem 0.25rem;
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
