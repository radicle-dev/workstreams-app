<script context="module">
	import { get } from 'svelte/store';
	import { providerStore } from 'web3-stores';
	import { workstreamStore } from '$lib/stores/workstreamsStore.js';
	const workstreams = get(workstreamStore);
	const provider = get(providerStore);

	let connectedAddress = provider.connected && provider.accounts[0];

	let myWorkstreams = [];
	let pendingApplications = [];
	export async function load() {
		workstreams.map((workstream) => {
			if (connectedAddress === workstream.creator.toLowerCase()) {
				myWorkstreams = [workstream, ...myWorkstreams];
				workstream.applications.map((application) => {
					if (application.state === 'pending') {
						pendingApplications = [application, ...pendingApplications];
					}
				});
			}
		});
		return { props: { myWorkstreams, pendingApplications } };
	}
</script>

<script lang="ts">
	import WorkstreamRow from '@components/WorkstreamRow/index.svelte';
	import ApplicationRow from '@components/ApplicationRow/index.svelte';
	import SegmentedControl from '$lib/shared/SegmentedControl.svelte';

	let workstreamFilter = 'active';
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
