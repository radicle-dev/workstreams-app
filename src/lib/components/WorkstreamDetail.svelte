<script lang="ts">
	import { timeframeFormat, dateFormat } from '$lib/utils/format';
	import * as modal from '$lib/utils/modal';
	import { walletStore } from '$lib/stores/wallet/wallet';

	import Card from '$components/Card.svelte';
	import User from '$components/User.svelte';
	import Badge from 'radicle-design-system/Badge.svelte';
	import ApplyModal from '$components/ApplyModal.svelte';
	import ApplicationModal from '$components/ApplicationModal.svelte';
	import Apply from 'radicle-design-system/icons/Ledger.svelte';
	import ThumbsDown from 'radicle-design-system/icons/ThumbsDown.svelte';
	import Button from 'radicle-design-system/Button.svelte';
	import Markdown from 'radicle-design-system/Markdown.svelte';
	import type { Application, Workstream } from '$lib/stores/workstreams/types';
	import ActionRow from '$components/ActionRow.svelte';

	export let workstream: Workstream;
	export let applications: Application[] | undefined = undefined;
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
		<Card hoverable={false}>
			<div slot="top">
				<h3>Applications</h3>
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
						disabled={$walletStore.connected &&
							workstream.applicants?.includes($walletStore.address)}
						icon={Apply}
						on:click={() => modal.show(ApplyModal, undefined, { workstream })}
					>
						Apply
					</Button>
				</div>
			</div>
			<div slot="bottom">
				{#if applications}
					{#each applications as application}
						<ActionRow>
							<div slot="left">
								<User address={application.creator} />
							</div>
							<div slot="right" class="row-actions">
								{#if application.counterOffer}
									<p>
										Proposes <span class="typo-text-bold"
											>{application.counterOffer.rate.toFixed(2)}
											{application.counterOffer.currency.toUpperCase()}</span
										> / 24h
									</p>
								{/if}
								{#if $walletStore.connected && $walletStore.address === workstream.creator}
									<Button variant="primary" icon={ThumbsDown}>Deny</Button>
								{/if}
								<Button
									on:click={() =>
										modal.show(ApplicationModal, undefined, { workstream, application })}
									>View</Button
								>
							</div>
						</ActionRow>
					{/each}
				{/if}
			</div>
		</Card>
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
	.row-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
	.desc {
		margin-top: 0.5rem;
		color: var(--color-foreground);
	}
	.timerate {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.timeframe {
		color: var(--color-foreground-level-6);
	}
	.rate {
		color: var(--color-primary);
	}
</style>
