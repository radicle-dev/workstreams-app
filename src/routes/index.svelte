<script context="module" lang="ts">
    /** @type {import('./[slug]').Load} */
	export async function load({ fetch }) {
        const url = `https://us-central1-radicle-workstreams.cloudfunctions.net/api/workstreams`;
        const response = await fetch(url);

        return {
            status: response.status,
            props: {
                workstreams: response.ok && (await response.json())
            }
        };
    }
</script>

<script lang="ts">
import ExploreCard from '$lib/components/ExploreCard.svelte';
import type { Workstream } from '$lib/stores/workstreams/types';

export let workstreams: Workstream[] = [];
</script>

<svelte:head>
	<title>Workstreams · Explore</title>
</svelte:head>

<div class="overview">
	{#each workstreams as workstream}
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
