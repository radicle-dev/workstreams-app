<script lang="ts">
	import { timeframeFormat, startDateFormat, dateFormat } from '$lib/utils/format';
	import Tag from '../../shared/Tag.svelte';
	import User from '../../shared/User.svelte';

	export let workstream;
</script>

<div class="container">
	<div class="metadata">
		<div class="title">
			<h1>{workstream.title}</h1>
			<Tag size="large">{workstream.type}</Tag>
		</div>
		<div class="owner">
			<span class="label">created by</span>
			<User address={workstream.owner} />
			<span class="label" style="margin-left: 0.5rem;">on {dateFormat(workstream.created_at)}</span>
		</div>
		<div class="timerate">
			{#if workstream.type === 'grant'}
				<div>
					<span class="label">Role start date</span>
					<p class="timeframe">{timeframeFormat(workstream.timeframe)}</p>
				</div>
			{:else if workstream.type === 'role'}
				<div>
					<span class="label">Grant duration</span>
					<p class="timeframe">Start {startDateFormat(workstream.start_date)}</p>
				</div>
			{/if}
			<div style="text-align: right;">
				<span class="label">Stream rate</span>
				<p class="typo-text-bold rate">
					{Math.floor(workstream.rate * 60 * 60 * 24)}
					{workstream.currency} <span class="typo-regular">/ day</span>
				</p>
			</div>
		</div>
		<div>
			<span class="label">Description</span>
			<p class="desc">{workstream.desc}</p>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 54rem;
		margin: 4rem auto;
		width: 100%;
	}
	.metadata > * {
		margin-bottom: 2rem;
	}

	.title,
	.owner {
		display: flex;
		align-items: center;
	}

	.title {
		margin-bottom: 0.5rem;
	}

	.owner > span {
		margin-right: 0.5rem;
	}

	.desc {
		margin-top: 0.5rem;
		color: var(--color-white);
	}

	.timerate {
		display: flex;
		justify-content: space-between;
	}

	.label {
		color: var(--color-grey-darker);
	}

	.timeframe {
		margin-top: 0.5rem;
		color: var(--color-white);
	}

	.rate {
		margin-top: 0.5rem;
		color: var(--color-pink);
	}
</style>
