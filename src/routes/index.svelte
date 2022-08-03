<script context="module" lang="ts">
  /* eslint-disable */
  /** @type {import('./[slug]').Load} */
  export async function load({ fetch }) {
    const workstreams = await workstreamsStore.getWorkstreams(
      {
        state: WorkstreamState.RFA
      },
      fetch
    );

    console.log(workstreams);

    return {
      status: 200,
      props: {
        workstreams: (workstreams.ok && workstreams.data) || []
      }
    };
  }
  /* eslint-enable */
</script>

<script lang="ts">
  import WorkstreamCard from '$lib/components/WorkstreamCard.svelte';
  import type { Workstream } from '$lib/stores/workstreams/types';
  import { WorkstreamState } from '$lib/stores/workstreams/types';
  import { workstreamsStore } from '$lib/stores/workstreams';
  import EmptyState from '$lib/components/EmptyState.svelte';

  export let workstreams: Workstream[] = [];

  let openWorkstreams: Workstream[] = [];

  $: {
    openWorkstreams = workstreams.filter(
      (workstream) => workstream.state === WorkstreamState.RFA
    );
  }
</script>

<svelte:head>
  <title>Workstreams · Explore</title>
</svelte:head>

{#if workstreams.length > 0}
  <div class="overview">
    {#each openWorkstreams as workstream}
      <WorkstreamCard {workstream} />
    {/each}
  </div>
{:else}
  <EmptyState
    emoji="🐚"
    headerText="No workstreams available"
    text="It looks like there are currently no workstreams available. Check back later or create your own on the Dashboard."
  />
{/if}

<style>
  .overview {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }

  @media only screen and (min-width: 75rem) {
    .overview {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.5rem;
    }
  }
  @media only screen and (max-width: 54rem) {
    .overview {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 0.5rem;
    }
  }
</style>
