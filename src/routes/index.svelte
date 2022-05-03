<script context="module" lang="ts">
  import { getConfig } from '$lib/config';

  /* eslint-disable */
  /** @type {import('./[slug]').Load} */
  export async function load({ fetch }) {
    const url = `${getConfig().API_URL_BASE}/workstreams`;
    const response = await fetch(url, { credentials: 'include' });

    return {
      status: response.status,
      props: {
        workstreams: response.ok && (await response.json())
      }
    };
  }
  /* eslint-enable */
</script>

<script lang="ts">
  import ExploreCard from '$lib/components/ExploreCard.svelte';
  import type { Workstream } from '$lib/stores/workstreams/types';
  import { WorkstreamState } from '$lib/stores/workstreams/types';

  export let workstreams: Workstream[] = [];

  let activeWorkstreams: Workstream[] = [];
  let openWorkstreams: Workstream[] = [];

  $: {
    openWorkstreams = workstreams.filter(
      (workstream) => workstream.state === WorkstreamState.RFA
    );
    activeWorkstreams = workstreams.filter(
      (workstream) => workstream.state === WorkstreamState.ACTIVE
    );
  }
</script>

<svelte:head>
  <title>Workstreams · Explore</title>
</svelte:head>

<div class="overview">
  {#each openWorkstreams as workstream}
    <ExploreCard {workstream} />
  {/each}
</div>

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
      gap: 1.5rem;
    }
  }
</style>
