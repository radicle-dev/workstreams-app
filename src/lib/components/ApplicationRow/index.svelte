<script lang="ts">
	import { goto } from '$app/navigation';
	import { startDateFormat, hyphanateString } from '$lib/utils/format';
	import Tag from '../../shared/Tag.svelte';
	import User from '../../shared/User.svelte';

	export let application;
</script>

<div on:click={() => goto(`/${hyphanateString(application.title)}`)} class="row">
	<div class="left">
		<div class="title">
			<User address={application.creator} showAddress={false} />
			<p class="typo-text-bold">{application.workstream_id}</p>
			<Tag>{application.state}</Tag>
		</div>
	</div>
	<div class="right">
		<p class="timeframe">Start {startDateFormat(application.created_at)}</p>
		<p class="typo-text-bold rate">
			{Math.floor(application.payment_rate * 60 * 60 * 24)}
			{application.currency} <span class="typo-regular">/ day</span>
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
