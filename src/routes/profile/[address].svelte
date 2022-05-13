<script context="module" lang="ts">
  /* eslint-disable */
  /** @type {import('./[slug]').Load} */
  export async function load({ params, fetch }) {
    const createdWorkstreams = await workstreamsStore.getWorkstreams(
      { createdBy: params.address },
      fetch
    );
    const assignedWorkstreams = await workstreamsStore.getWorkstreams(
      { assignedTo: params.address },
      fetch
    );

    return {
      status: createdWorkstreams.ok && assignedWorkstreams.ok ? 200 : 500,
      props: {
        createdWorkstreams: createdWorkstreams.ok && createdWorkstreams.data,
        assignedWorkstreams: assignedWorkstreams.ok && assignedWorkstreams.data,
        address: params.address
      }
    };
  }
  /* eslint-enable */
</script>

<script lang="ts">
  import { workstreamsStore } from '$lib/stores/workstreams/workstreams';
  import type { Workstream } from '$lib/stores/workstreams/types';

  import UserBig from '$components/UserBig.svelte';
  import Section from '$components/Dashboard/Section.svelte';
  import ExploreCard from '$lib/components/ExploreCard.svelte';

  export let createdWorkstreams: Workstream[] = [];
  export let assignedWorkstreams: Workstream[] = [];
  export let address: string;
</script>

<svelte:head>
  <title>Workstreams · Profile</title>
</svelte:head>

<div class="container">
  <UserBig {address} />
  <div class="overview">
    {#if assignedWorkstreams.length > 0}
      <Section title="Assigned workstreams" count={assignedWorkstreams.length}>
        <div slot="content" class="workstreams">
          {#each assignedWorkstreams as workstream}
            <ExploreCard {workstream} />
          {/each}
        </div>
      </Section>
    {/if}
    {#if createdWorkstreams.length > 0}
      <Section title="Created workstreams" count={createdWorkstreams.length}>
        <div slot="content" class="workstreams">
          {#each createdWorkstreams as workstream}
            <ExploreCard {workstream} />
          {/each}
        </div>
      </Section>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 75rem;
    margin: 0 auto;
    width: 100%;
  }

  .overview {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    margin-top: 4rem;
  }
  .workstreams {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }

  @media only screen and (min-width: 75rem) {
    .workstreams {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.5rem;
    }
  }
  @media only screen and (max-width: 54rem) {
    .workstreams {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1.5rem;
    }
  }
</style>
