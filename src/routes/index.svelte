<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { workstreamsStore } from '$lib/stores/workstreams';
	import WorkstreamCard from '$components/WorkstreamCard.svelte';
</script>

<svelte:head>
	<title>Workstreams · Overview</title>
</svelte:head>

<div class="overview">
	{#each $workstreamsStore as workstream}
		<WorkstreamCard data={workstream} />
	{/each}
</div>

<style>
	.overview {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}
</style>
