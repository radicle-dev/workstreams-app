<script lang="ts">
	import { timeframeFormat, dateFormat } from '$lib/utils/format';
	import * as modal from '$lib/utils/modal';
	import { walletStore } from '$lib/stores/wallet/wallet';

	import Card from '$components/Card.svelte';
	import User from '$components/User.svelte';
	import Rate from '$components/Rate.svelte';
	import Badge from 'radicle-design-system/Badge.svelte';
	import ApplyModal from '$components/ApplyModal.svelte';
	import ApplicationModal from '$components/ApplicationModal.svelte';
	import Apply from 'radicle-design-system/icons/Ledger.svelte';
	import Cross from 'radicle-design-system/icons/Cross.svelte';
	import ThumbsDown from 'radicle-design-system/icons/ThumbsDown.svelte';
	import Button from 'radicle-design-system/Button.svelte';
	import Tooltip from 'radicle-design-system/Tooltip.svelte';
	import Markdown from 'radicle-design-system/Markdown.svelte';
	import {
		WorkstreamState,
		ApplicationState,
		type Application,
		type Workstream
	} from '$lib/stores/workstreams/types';
	import ActionRow from '$components/ActionRow.svelte';

	export let workstream: Workstream;
	export let applications: Application[] | undefined = undefined;

	let activeApplication: Application | undefined = undefined;
	let rejectedApplications: Application[] | undefined = undefined;

	let applied: boolean =
		$walletStore.connected && workstream.applicants?.includes($walletStore.address);
	let creator: boolean = $walletStore.connected && workstream.creator === $walletStore.address;

	$: {
		if (workstream.state === WorkstreamState.ACTIVE) {
			activeApplication = applications.find(
				(application) => application.state === ApplicationState.ACCEPTED
			);
			rejectedApplications = applications.filter(
				(application) => application.state === ApplicationState.REJECTED
			);
		}
	}
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
						<Rate rate={workstream.payment.rate} currency={workstream.payment.currency} />
					</div>
					{#if workstream.type === 'grant' && workstream.duration}
						<div>
							<p class="timeframe">{timeframeFormat(workstream.duration)}</p>
						</div>
						{#if workstream.type === 'grant' && workstream.duration}
							<div>
								<p class="timeframe">{timeframeFormat(workstream.duration)}</p>
							</div>
							<div slot="right" class="row-actions">
								{#if application.counterOffer}
									<p class="proposal">
										Proposes <Rate
											icon={false}
											rate={application.counterOffer.rate}
											currency={application.counterOffer.currency}
										/>
									</p>
								{/if}
								{#if $walletStore.connected && $walletStore.address === workstream.creator}
									<Button variant="primary" icon={ThumbsDown}>Deny</Button>
								{/if}
								<Button
									disabled={applied}
									icon={Apply}
									on:click={() => modal.show(ApplyModal, undefined, { workstream })}
								>
									Apply for {workstream.type}
								</Button>
							</Tooltip>
						{/if}
					</div>
				</div>
			</Card>
		{:else}
			<Card hoverable={false}>
				<div slot="top">
					<h3 style="margin-bottom: 1rem;">Active stream</h3>
					<div class="timerate">
						<div style="text-align: right;">
							<Rate rate={workstream.payment.rate} currency={workstream.payment.currency} />
						</div>
						<div>
							<p class="timeframe">Active since Jan 5, 2022</p>
						</div>
					</div>
				</div>
				<div slot="bottom">
					<ActionRow>
						<div slot="left">
							<User address={activeApplication.creator} />
						</div>
						<div slot="right" class="row-actions">
							<p class="proposal">4020 DAI left (8.04 days)</p>
							<Button
								on:click={() =>
									modal.show(ApplicationModal, undefined, { workstream, activeApplication })}
								>View application</Button
							>
						</div>
					</ActionRow>
					<div class="stream-actions">
						<p>5000 of 8000 DAI topped up</p>
						<div style="display: flex; gap: .75rem;">
							<Button variant="primary-outline" icon={Cross}>Pause</Button>
							<Button>Top up</Button>
						</div>
					</div>
				</div>
			</Card>
			<Card hoverable={false} style="margin-top: 1rem;">
				<div slot="top">
					<h3>Rejected applications</h3>
				</div>
				<div slot="bottom">
					{#if rejectedApplications}
						{#each rejectedApplications as application}
							<ActionRow>
								<div slot="left">
									<User address={application.creator} />
								</div>
								<div slot="right" class="row-actions">
									{#if application.counterOffer}
										<p class="proposal">Rejected</p>
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
		{/if}
		{#if workstream.state === WorkstreamState.RFA && applications.length > 0}
			<Card hoverable={false}>
				<div slot="top">
					<h3>Open applications</h3>
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
										<p class="proposal">
											Proposes <Rate
												icon={false}
												rate={application.counterOffer.rate}
												currency={application.counterOffer.currency}
											/>
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
		{/if}
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

	.proposal {
		display: flex;
		color: var(--color-primary);
		gap: 0.5rem;
	}
	.row-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
	.desc {
		margin-top: 2rem;
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
</style>
