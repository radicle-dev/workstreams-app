<script lang="ts">
	import { timeframeFormat, startDateFormat, dateFormat } from '$lib/utils/format';
	import Tag from '$lib/shared/Tag.svelte';
	import User from '$lib/shared/User.svelte';
	import Input from '$lib/shared/Input.svelte';
	import Markdown from '$lib/shared/Markdown.svelte';
	import ApplicationRow from '@components/ApplicationRow/index.svelte';

	export let workstream;
	let applicationText: string;
</script>

<div class="container">
	<div class="metadata">
		<div class="title">
			<h1 style="margin-right: 1rem;">{workstream.title}</h1>
			<Tag size="large">{workstream.type}</Tag>
		</div>
		<div class="owner">
			<span class="label">created by</span>
			<User address={workstream.creator} />
			<span class="label" style="margin-left: 0.5rem;">on {dateFormat(workstream.created_at)}</span>
		</div>
		<div class="timerate">
			{#if workstream.type === 'grant'}
				<div>
					<span class="label">Role start date</span>
					<p class="timeframe">{timeframeFormat(workstream.starting_at, workstream.ending_at)}</p>
				</div>
			{:else if workstream.type === 'role'}
				<div>
					<span class="label">Grant duration</span>
					<p class="timeframe">Start {startDateFormat(workstream.startin_at)}</p>
				</div>
			{/if}
			<div style="text-align: right;">
				<span class="label">Stream rate</span>
				<p class="typo-text-bold rate">
					{Math.floor(workstream.payment_rate * 60 * 60 * 24)}
					{workstream.payment_currency} <span class="typo-regular">/ day</span>
				</p>
			</div>
		</div>
		<div>
			<span class="label">Description</span>
			<div class="desc">
				<Markdown content={workstream.desc} />
			</div>
		</div>
	</div>
	<hr />
	{#if workstream.applications}
		<div class="applications">
			<h4>Pending applications</h4>
			<div>
				{#each workstream.applications as application}
					<ApplicationRow {application} />
				{/each}
			</div>
		</div>
	{/if}
	<div class="application-form">
		<User address="0x1c4fB2BF4967A9AEe0081E174a7D38b356029a84" style="margin: 2rem 0 1rem;" />
		<Input
			type="textarea"
			label="Application form"
			placeholder="markdown supported"
			bind:value={applicationText}
		/>
		<button class="apply" disabled={applicationText === undefined || applicationText === ''}
			>Submit application</button
		>
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

	hr {
		border-bottom: 1px solid var(--color-pink);
	}

	.applications {
		margin-top: 1.5rem;
	}

	.applications h4 {
		margin-bottom: 1rem;
	}
	.application-form {
		display: flex;
		flex-direction: column;
	}

	.apply {
		margin-top: 1rem;
		align-self: flex-end;
	}
</style>
