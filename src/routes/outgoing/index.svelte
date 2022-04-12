<script context="module" lang="ts">
	import { get } from 'svelte/store';

	import { providerStore } from 'web3-stores';
	import workstreamsStore from '$lib/stores/workstreams/workstreams';
	import type { Application, Workstream } from '$lib/stores/workstreams/types';

	const provider = get(providerStore);
	const streams: Workstream[] = get(workstreamsStore);

	let connectedAddress = provider.connected && provider.accounts[0];

	let myWorkstreams = [];
	let pendingApplications = [];

	// TODO Pass param address.
	export const load = async (): Promise<{
		props: { myWorkstreams: Workstream[]; pendingApplications: Application[] };
	}> => {
		streams.map((workstream) => {
			if (connectedAddress === workstream.creator.toLowerCase()) {
				myWorkstreams = [workstream, ...myWorkstreams];
				// workstream.applications.map((application) => {
				// 	if (application.state === 'pending') {
				// 		pendingApplications = [application, ...pendingApplications];
				// 	}
				// });
			}
		});

		return { props: { myWorkstreams, pendingApplications } };
	};
</script>

<script lang="ts">
	import WorkstreamRow from '$components/WorkstreamRow.svelte';
	import ApplicationRow from '$components/ApplicationRow.svelte';
	import SegmentedControl from '$components/SegmentedControl.svelte';

	const workstreamOptions = [
		{
			title: 'Active',
			value: 'active'
		},
		{
			title: 'Past',
			value: 'past'
		}
	];

	let workstreamFilter = 'active';
</script>

<div class="container">
	{#if pendingApplications.length > 0}
		<section>
			<div class="title">
				<h3>New applications</h3>
			</div>
			<div class="row-container">
				{#each pendingApplications as application}
					<ApplicationRow {application} owner={true} />
				{/each}
			</div>
		</section>
	{/if}
	<section>
		<div class="title">
			<h3>Created workstreams</h3>
			<SegmentedControl
				active={workstreamFilter}
				options={workstreamOptions}
				on:select={(ev) => (workstreamFilter = ev.detail)}
			/>
		</div>
		<div class="row-container">
			{#each myWorkstreams as workstream}
				<WorkstreamRow data={workstream} />
			{/each}
		</div>
	</section>
</div>

<style>
	.container {
		max-width: 54rem;
		margin: 4rem auto;
		width: 100%;
	}
	section {
		margin-bottom: 2.5rem;
	}
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}
</style>
