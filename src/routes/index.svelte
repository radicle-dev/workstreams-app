<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { workstreamsStore } from '$lib/stores/workstreams';
	import ExploreCard from '$lib/components/ExploreCard.svelte';
</script>

<svelte:head>
	<title>Workstreams · Explore</title>
</svelte:head>

<div class="overview">
	{#each $workstreamsStore as workstream}
		<ExploreCard {workstream} />
	{/each}
</div>

<style>
	.overview {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.5rem;
	}
</style>
