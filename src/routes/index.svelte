<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Protected from '@components/Protected/index.svelte';
	import WorkstreamCard from '@components/WorkstreamCard/index.svelte';

	let workstreams = [
		{ name: 'Rinkeby faucet', owner: '0xjkfsklj234', type: 'grant', rate: 1.1 },
		{ name: 'other stream', owner: '0xjkfsklj234', type: 'role', rate: 2 }
	];
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<Protected>
	<section>
		<h1>Workstreams Overview</h1>
		<div class="workstreams">
			{#each workstreams as workstream}
				<WorkstreamCard data={workstream} />
			{/each}
		</div>
	</section>
</Protected>

<style>
</style>