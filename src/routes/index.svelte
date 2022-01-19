<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import WorkstreamCard from '$lib/WorkstreamCard.svelte';

	let workstreams = [
		{ name: 'Rinkeby faucet', owner: '0xjkfsklj234', type: 'grant', rate: 1.1 },
		{ name: 'other stream', owner: '0xjkfsklj234', type: 'role', rate: 2 }
	];
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>workstream</h1>
	<div class="workstreams">
		{#each workstreams as workstream}
			<WorkstreamCard data={workstream} />
		{/each}
	</div>
</section>

<style>
</style>
