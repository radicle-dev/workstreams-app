<script lang="ts">
	import { timeframeFormat, startDateFormat } from '$lib/utils/format';
	import Tag from '../../shared/Tag.svelte';
	import User from '../../shared/User.svelte';

	export let workstream;
</script>

<div class="top">
	<div class="title">
		<h2>{workstream.title}</h2>
		<Tag>{workstream.type}</Tag>
	</div>
	<div class="owner">
		<span>by</span>
		<User address={workstream.owner} />
	</div>
	<p class="desc">{workstream.desc}</p>
</div>
<div class="bottom">
	{#if workstream.type === 'grant'}
		<p class="timeframe">{timeframeFormat(workstream.timeframe)}</p>
	{:else if workstream.type === 'role'}
		<p class="timeframe">Start {startDateFormat(workstream.start_date)}</p>
	{/if}
	<p class="typo-text-bold rate">
		{Math.floor(workstream.rate * 60 * 60 * 24)}
		{workstream.currency} <span class="typo-regular">/ day</span>
	</p>
</div>

<style>
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
		color: var(--color-grey-dark);
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
