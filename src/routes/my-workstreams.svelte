<script lang="ts">
	import { workstreams } from '$lib/stores/workstreamsStore';
	import WorkstreamRow from '@components/WorkstreamRow/index.svelte';
	import ApplicationRow from '@components/ApplicationRow/index.svelte';
	import SegmentedControl from '$lib/shared/SegmentedControl.svelte';

	let workstreamFilter: string = 'active';
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

	let applicationFilter: string = 'open';
	const applicationOptions = [
		{
			title: 'Open',
			value: 'open'
		},
		{
			title: 'Rejected',
			value: 'rejected'
		}
	];
</script>

<div class="container">
	<section>
		<div class="title">
			<h3>My {workstreamFilter} workstreams</h3>
			<SegmentedControl
				active={workstreamFilter}
				options={workstreamOptions}
				on:select={(ev) => (workstreamFilter = ev.detail)}
			/>
		</div>
		<div class="row-container">
			{#each $workstreams as workstream}
				<WorkstreamRow data={workstream} />
			{/each}
		</div>
	</section>
	<section>
		<div class="title">
			<h3>My {applicationFilter} applications</h3>
			<SegmentedControl
				active={applicationFilter}
				options={applicationOptions}
				on:select={(ev) => (applicationFilter = ev.detail)}
			/>
		</div>
		<div class="row-container">
			{#each $workstreams as workstream}
				<ApplicationRow data={workstream} />
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
