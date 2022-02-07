<script context="module" lang="ts">
	import { get } from 'svelte/store';
	import { workstreamsStore } from '$lib/stores/workstreams';
	import type { Application, Workstreams } from '$lib/types';

	const streams: Workstreams = get(workstreamsStore);

	let myWorkstreams = [];
	let pendingApplications = [];

	// TODO Pass param address.
	export const load = async (): Promise<{
		props: { myWorkstreams: Workstreams; pendingApplications: Application[] };
	}> => {
		streams.map((workstream) => {
			if (workstream.creator === '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471') {
				myWorkstreams = [workstream, ...myWorkstreams];
				workstream.applications.map((application) => {
					if (application.state === 'pending') {
						pendingApplications = [application, ...pendingApplications];
					}
				});
			}
		});

		return { props: { myWorkstreams, pendingApplications } };
	};
</script>

<script lang="ts">
	import WorkstreamRow from '$lib/components/WorkstreamRow.svelte';
	import ApplicationRow from '$lib/components/ApplicationRow.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';

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
				<h3>My applications</h3>
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
