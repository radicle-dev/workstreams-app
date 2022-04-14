<script lang="ts">
	import { timeframeFormat, dateFormat } from '$lib/utils/format';
	import User from '$components/User.svelte';
	import Tag from '$components/Tag.svelte';
	import Markdown from '$components/Markdown.svelte';
	import type { Workstream } from '$lib/stores/workstreams/types';

	export let workstream: Workstream;
</script>

<div class="container">
	<div class="metadata">
		<div class="title">
			<h1 style="margin-right: 1rem;">{workstream.title}</h1>
			<Tag>{workstream.type}</Tag>
		</div>
		<div class="owner">
			<span class="label">created by</span>
			<User address={workstream.creator} />
			<span class="label" style="margin-left: 0.5rem;">on {dateFormat(workstream.created_at)}</span>
		</div>
		<div class="timerate">
			{#if workstream.type === 'grant' && workstream.duration}
				<div>
					<p class="timeframe">{timeframeFormat(workstream.duration)}</p>
				</div>
			{/if}
			<div style="text-align: right;">
				<p class="typo-text-bold rate">
					{Math.floor(workstream.payment.rate)}
					{workstream.payment.currency} <span class="typo-regular">/ day</span>
				</p>
			</div>
		</div>
		<div>
			<div class="desc">
				<Markdown content={workstream.desc} />
			</div>
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
		justify-content: space-between;
	}
	.owner > span {
		margin-right: 0.5rem;
	}
	.desc {
		margin-top: 0.5rem;
		color: var(--color-foreground);
	}
	.timerate {
		display: flex;
		justify-content: space-between;
	}
	.timeframe {
		margin-top: 0.5rem;
		color: var(--color-foreground);
	}
	.rate {
		margin-top: 0.5rem;
		color: var(--color-primary);
	}
</style>
