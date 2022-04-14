<script lang="ts">
	import type { Workstream } from '$lib/stores/workstreams/types';
	import * as modal from '$lib/utils/modal';
	import Create from '$components/CreateModal.svelte';
	import SegmentedControl from '$components/SegmentedControl.svelte';
	import Button from '$components/Button.svelte';
	import TokenStreamsIcon from '$components/icons/TokenStreams.svelte';
	import WorkstreamCard from '$components/WorkstreamCard.svelte';
	import { getConfig } from '$lib/config';
	import { walletStore } from '$lib/stores/wallet/wallet';

	let workstreams: Workstream[] = [];

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
		if ($walletStore.connected) {
			(async () => {
				const result = await fetch(`${getConfig().API_URL_BASE}/workstreams?createdBy=${$walletStore.address}`, {
					credentials: 'include',
				});

				workstreams = await result.json();
			})();
		};
	}

	let applicationFilter = 'all';
</script>

<svelte:head>
	<title>Workstreams · Dashboard</title>
</svelte:head>

<div class="container">
	<header>
		<SegmentedControl
			active={applicationFilter}
			options={applicationOptions}
			on:select={(ev) => (applicationFilter = ev.detail)}
		/>
		<Button on:click={() => modal.show(Create)}><TokenStreamsIcon />Create workstream</Button>
	</header>
	<main>
		{#each workstreams as workstream}
			<WorkstreamCard {workstream} />
		{/each}
	</main>
</div>

<style>
	.container {
		max-width: 75rem;
		margin: 0 auto;
		width: 100%;
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
