<script lang="ts">
	import type { Workstream } from '$lib/stores/workstreams/types';
	import * as modal from '$lib/utils/modal';
	import CreateModal from '$components/CreateModal.svelte';
	import SegmentedControl from 'radicle-design-system/SegmentedControl.svelte';
	import Button from 'radicle-design-system/Button.svelte';
	import TokenStreamsIcon from 'radicle-design-system/icons/TokenStreams.svelte';
	import WorkstreamCard from '$components/WorkstreamCard.svelte';
	import { getConfig } from '$lib/config';
	import { walletStore } from '$lib/stores/wallet/wallet';
	import { authStore } from '$lib/stores/auth/auth';
	import { browser } from '$app/env';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

	let workstreams: Workstream[] = [];

	let locked: boolean;

	const applicationOptions = [
		{
			title: 'All',
			value: 'all'
		},
		{
			title: 'Role',
			value: 'role'
		},
		{
			title: 'Grant',
			value: 'grant'
		}
	];

	$: {
		if ($walletStore.connected && $authStore.authenticated) {
			(async () => {
				const result = await fetch(
					`${getConfig().API_URL_BASE}/workstreams?createdBy=${$walletStore.address}`,
					{
						credentials: 'include'
					}
				);

				workstreams = await result.json();
			})();
		}
	}

	async function authenticate() {
		locked = true;
		try {
			if (!$walletStore.connected) await walletStore.connect();
			if (!$connectedAndLoggedIn) await authStore.authenticate($walletStore);
		} finally {
			locked = false;
		}
	}

	let applicationFilter = 'all';
</script>

<svelte:head>
	<title>Workstreams · Dashboard</title>
</svelte:head>

<div class="container">
	{#if browser && $authStore.authenticated && $walletStore.connected}
		<header>
			<SegmentedControl
				style="border: 0;"
				active={applicationFilter}
				options={applicationOptions}
				on:select={(ev) => (applicationFilter = ev.detail)}
			/>
			<Button icon={TokenStreamsIcon} on:click={() => modal.show(CreateModal)}
				>Create workstream</Button
			>
		</header>
		<main>
			{#each workstreams as workstream}
				<WorkstreamCard {workstream} />
			{/each}
		</main>
	{:else}
		<div class="empty-wrapper">
			<EmptyState
				headerText="Sign in to view your workstreams"
				text="This is where the workstreams you created or are contributing to show up."
				primaryActionText="Sign in with Ethereum"
				on:primaryAction={authenticate}
				primaryActionDisabled={locked}
			/>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 75rem;
		margin: 0 auto;
		width: 100%;
	}

	.empty-wrapper {
		display: flex;
		min-height: 32rem;
		justify-content: center;
		align-items: center;
	}
	header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}
	main {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.5rem;
	}
</style>
