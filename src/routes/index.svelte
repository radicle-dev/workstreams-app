<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { workstreamStore } from '$lib/stores/workstreamsStore.js';
	import WorkstreamCard from '@components/WorkstreamCard/index.svelte';
</script>

<svelte:head>
	<title>Workstreams · Overview</title>
</svelte:head>

<section>
	<div class="overview">
		{#each $workstreamStore as workstream}
			<WorkstreamCard data={workstream} />
		{/each}
	</div>
</section>

<style>
	.overview {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}
</style>
