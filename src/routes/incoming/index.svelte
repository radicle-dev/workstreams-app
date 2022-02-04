<script context="module">
	import { get } from 'svelte/store';
	import { workstreams } from '$lib/stores/workstreamsStore.js';
	const workstreamsData = get(workstreams);

	let myOpenApplications = [];
	let myRejectedApplications = [];
	export async function load() {
		workstreamsData.map((workstream) => {
			workstream.applications.map((application) => {
				if (
					application.creator === '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471' &&
					application.state !== 'rejected'
				) {
					return (myOpenApplications = [application, ...myOpenApplications]);
				} else if (
					application.creator === '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471' &&
					application.state === 'rejected'
				) {
					return (myRejectedApplications = [application, ...myRejectedApplications]);
				}
			});
		});
		return { props: { myOpenApplications } };
	}
</script>

<script lang="ts">
	import ApplicationRow from '@components/ApplicationRow/index.svelte';
	import SegmentedControl from '$lib/shared/SegmentedControl.svelte';

	let applicationFilter = 'all';
	const applicationOptions = [
		{
			title: 'Accepted',
			value: 'accepted'
		},
		{
			title: 'Pending',
			value: 'pending'
		},

		{
			title: 'All',
			value: 'all'
		}
	];
</script>

<div class="container">
	<section>
		<div class="title">
			<h3>My applications</h3>
			<SegmentedControl
				active={applicationFilter}
				options={applicationOptions}
				on:select={(ev) => (applicationFilter = ev.detail)}
			/>
		</div>
		<div class="row-container">
			{#each myOpenApplications as application}
				<ApplicationRow {application} owner={true} />
			{/each}
		</div>
	</section>
	{#if myRejectedApplications.length > 0}
		<section>
			<div class="title">
				<h3>Rejected applications</h3>
			</div>
			<div class="row-container">
				{#each myRejectedApplications as application}
					<ApplicationRow {application} owner={true} />
				{/each}
			</div>
		</section>
	{/if}
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
