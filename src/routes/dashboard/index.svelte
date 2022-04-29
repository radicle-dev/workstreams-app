<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  import { walletStore } from '$lib/stores/wallet/wallet';
  import { authStore } from '$lib/stores/auth/auth';
  import { browser } from '$app/env';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';
  import Section from '$lib/components/dashboard/Section.svelte';
  import { getConfig } from '$lib/config';

  import {
    WorkstreamState,
    type Application,
    type Workstream
  } from '$lib/stores/workstreams/types';
  import WorkstreamCard from '$lib/components/WorkstreamCard.svelte';

  let locked: boolean;

  enum SectionName {
    APPLIED_TO,
    PENDING,
    APPLICATIONS_TO_REVIEW,
    ACTIVE,
    CREATED,
    ENDED
  }

  interface SectionData {
    title: string;
    data?: Workstream[];
  }

  function buildUrl(params: { [key: string]: string }) {
    const paramsString = new URLSearchParams(params).toString();

    return `${getConfig().API_URL_BASE}/workstreams?${paramsString}`;
  }

  let sections: { [key in SectionName]: SectionData } = {
    [SectionName.APPLIED_TO]: {
      title: 'Workstreams you applied to'
    },
    [SectionName.PENDING]: {
      title: 'Workstreams pending payment setup'
    },
    [SectionName.APPLICATIONS_TO_REVIEW]: {
      title: 'Applications to review'
    },
    [SectionName.CREATED]: {
      title: 'Waiting for applications'
    },
    [SectionName.ACTIVE]: {
      title: 'Active workstreams'
    },
    [SectionName.ENDED]: {
      title: 'Ended workstreams'
    }
  };

  $: {
    if ($connectedAndLoggedIn) {
      fetchSectionData();
    } else {
      clearSectionData();
    }
  }

  function fetchSectionData() {
    if (!$walletStore.connected)
      throw new Error("Can't fetch dashboard before connected to wallet");

    const urls: { [key in SectionName]: string } = {
      [SectionName.APPLIED_TO]: buildUrl({
        applied: 'true',
        state: 'rfa'
      }),
      [SectionName.CREATED]: buildUrl({
        state: 'rfa',
        createdBy: $walletStore.address,
        hasApplicationsToReview: 'false'
      }),
      [SectionName.PENDING]: buildUrl({
        state: WorkstreamState.PENDING,
        createdBy: $walletStore.address
      }),
      [SectionName.APPLICATIONS_TO_REVIEW]: buildUrl({
        createdBy: $walletStore.address,
        hasApplicationsToReview: 'true'
      }),
      [SectionName.ACTIVE]: buildUrl({
        state: WorkstreamState.ACTIVE,
        assignee: $walletStore.address
      }),
      [SectionName.ENDED]: buildUrl({
        state: WorkstreamState.CLOSED,
        assignee: $walletStore.address
      })
    };

    Object.keys(urls).forEach((sectionName) => {
      fetch(urls[sectionName], { credentials: 'include' }).then(
        async (response) => {
          if (response.status !== 200) return;

          sections[sectionName] = {
            ...sections[sectionName],
            data: await response.json()
          };
        }
      );
    });
  }

  function clearSectionData() {
    Object.keys(sections).forEach((sectionName) => {
      sections[sectionName].data = undefined;
    });
  }

  async function authenticate() {
    locked = true;
    try {
      if (!$walletStore.connected) await walletStore.connect();
      if (!$connectedAndLoggedIn) await authStore.authenticate($walletStore);
    } finally {
      locked = false;
    }
  }
</script>

<svelte:head>
  <title>Workstreams · Dashboard</title>
</svelte:head>

<div class="container">
  {#if browser && $authStore.authenticated && $walletStore.connected}
    <div class="sections">
      {#each Object.keys(sections).filter((sn) => !!sections[sn].data) as sectionName (sectionName)}
        <div
          class="section"
          animate:flip={{ duration: 300 }}
          in:fly={{ y: 10, duration: 300 }}
        >
          <Section
            title={sections[sectionName].title}
            count={sections[sectionName].data.length}
          >
            <div class="workstreams">
              {#each sections[sectionName].data as workstream}
                <div class="workstream"><WorkstreamCard {workstream} /></div>
              {/each}
            </div>
          </Section>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-wrapper">
      <EmptyState
        headerText="Sign in to view your workstreams"
        text="This is where the workstreams you created or are contributing to show up."
        primaryActionText="Sign in with Ethereum"
        on:primaryAction={authenticate}
        primaryActionDisabled={locked}
      />
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 75rem;
    margin: 0 auto;
    width: 100%;
  }

  .empty-wrapper {
    display: flex;
    min-height: 32rem;
    justify-content: center;
    align-items: center;
  }

  .sections {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .workstreams {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .workstreams > .workstream {
    width: calc(50% - 0.5rem);
  }
</style>
