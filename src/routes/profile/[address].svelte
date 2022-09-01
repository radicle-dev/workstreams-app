<script context="module" lang="ts">
  /* eslint-disable */
  /** @type {import('./[slug]').Load} */
  export async function load({ params, fetch }) {
    const fetches = [
      workstreamsStore.getWorkstreams(
        { createdBy: params.address.toLowerCase() },
        fetch
      ),
      workstreamsStore.getWorkstreams(
        { assignedTo: params.address.toLowerCase() },
        fetch
      )
    ];
    const responses = await Promise.all(fetches);

    return {
      props: {
        createdWorkstreams: responses[0].ok ? responses[0].data : [],
        assignedWorkstreams: responses[1].ok ? responses[1].data : []
      }
    };
  }
  /* eslint-enable */
</script>

<script lang="ts">
  import { utils } from 'ethers';
  import { page } from '$app/stores';
  import { workstreamsStore } from '$lib/stores/workstreams';
  import type { Workstream } from '$lib/stores/workstreams/types';

  import UserBig from '$components/UserBig.svelte';
  import Section from '$lib/components/Section.svelte';
  import WorkstreamCard from '$lib/components/WorkstreamCard.svelte';
  import EmptyState from '$components/EmptyState.svelte';
  import { walletStore } from '$lib/stores/wallet/wallet';

  export let createdWorkstreams: Workstream[] = [];
  export let assignedWorkstreams: Workstream[] = [];

  $: assignedWorkstreamsOnCurrentChain = $walletStore.ready
    ? assignedWorkstreams.filter(
        (w) =>
          !w.dripsData || w.dripsData.chainId === $walletStore.network.chainId
      )
    : assignedWorkstreams;

  const formatAddress = (addr?: string | undefined) => {
    if (addr) {
      if (addr.length > 10) {
        return (
          addr.substring(0, 4) +
          ' – ' +
          addr.substring(addr.length - 4, addr.length)
        );
      } else {
        return addr;
      }
    }
  };
</script>

<svelte:head>
  <title>Workstreams · Profile</title>
</svelte:head>

<div class="container">
  {#if utils.isAddress($page.params.address)}
    <UserBig address={$page.params.address} />
    <div class="overview">
      {#if !assignedWorkstreamsOnCurrentChain && !createdWorkstreams}
        <EmptyState
          emoji="👀"
          headerText="Nothing to see here"
          text="This address has no associated workstreams"
        />
      {:else}
        {#if assignedWorkstreamsOnCurrentChain?.length > 0}
          <Section
            title="Assigned workstreams"
            count={assignedWorkstreamsOnCurrentChain.length}
          >
            <div slot="content" class="workstreams">
              {#each assignedWorkstreamsOnCurrentChain as workstream}
                <WorkstreamCard {workstream} />
              {/each}
            </div>
          </Section>
        {/if}
        {#if createdWorkstreams?.length > 0}
          <Section
            title="Created workstreams"
            count={createdWorkstreams.length}
          >
            <div slot="content" class="workstreams">
              {#each createdWorkstreams as workstream}
                <WorkstreamCard {workstream} />
              {/each}
            </div>
          </Section>
        {/if}
      {/if}
    </div>
  {:else}
    <EmptyState
      emoji="🏚"
      headerText="Invalid address"
      text={`It seems that ${formatAddress(
        $page.params.address
      )} is not a valid ethereum address.`}
    />
  {/if}
</div>

<style>
  .container {
    padding-top: 2rem;
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
