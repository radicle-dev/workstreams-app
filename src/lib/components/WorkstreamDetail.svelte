<script lang="ts">
	import { timeframeFormat, dateFormat } from '$lib/utils/format';
	import * as modal from '$lib/utils/modal';

	import User from '$components/User.svelte';
	import Badge from 'radicle-design-system/Badge.svelte';
	import ApplyModal from '$components/ApplyModal.svelte';
	import Apply from 'radicle-design-system/icons/Ledger.svelte';
	import Button from 'radicle-design-system/Button.svelte';
	import Markdown from 'radicle-design-system/Markdown.svelte';
	import type { Workstream } from '$lib/stores/workstreams/types';
	import { walletStore } from '$lib/stores/wallet/wallet';

	export let workstream: Workstream;
</script>

<div class="container">
	<div class="metadata">
		<div class="title">
			<h1 style="margin-right: 1rem;">{workstream.title}</h1>
			<Badge style="font-weight: 600;" text={workstream.type} />
		</div>
		<div class="owner">
			<span class="label">created by</span>
			<User address={workstream.creator} />
			<span class="label" style="margin-left: 0.5rem;">on {dateFormat(workstream.created_at)}</span>
		</div>
		<div class="timerate">
			<div style="text-align: right;">
				<p class="typo-text-bold rate">
					{Math.floor(workstream.payment.rate)}
					{workstream.payment.currency} <span class="typo-regular">/ day</span>
				</p>
			</div>
			{#if workstream.type === 'grant' && workstream.duration}
				<div>
					<p class="timeframe">{timeframeFormat(workstream.duration)}</p>
				</div>
			{/if}
			<Button
				disabled={$walletStore.connected && workstream.applicants?.includes($walletStore.address)}
				icon={Apply}
				on:click={() => modal.show(ApplyModal, undefined, { workstream })}
			>
				Apply
			</Button>
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
		align-items: center;
		padding: 1rem;
		border: 1px solid var(--color-foreground-level-3);
		border-radius: 1rem;
	}
	.timeframe {
		color: var(--color-foreground-level-6);
	}
	.rate {
		color: var(--color-primary);
	}
</style>
