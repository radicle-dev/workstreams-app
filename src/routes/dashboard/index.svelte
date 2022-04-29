<script lang="ts">
  import { walletStore } from '$lib/stores/wallet/wallet';
  import { authStore } from '$lib/stores/auth/auth';
  import { browser } from '$app/env';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';
  import Section from '$lib/components/dashboard/Section.svelte';
  import { getConfig } from '$lib/config';
  import { onMount } from 'svelte';
  import {
    WorkstreamState,
    type Application,
    type Workstream
  } from '$lib/stores/workstreams/types';

  let locked: boolean;

  enum SectionName {
    APPLIED_TO,
    TO_REVIEW,
    PENDING,
    ACTIVE,
    ENDED
  }

  interface SectionData {
    title: string;
    data?: Workstream | Application;
  }

  function buildUrl(url: URL, params: { [key: string]: string }) {
    const urlString = url.toString();
    const paramsString = new URLSearchParams(params).toString();

    return `${urlString}?${paramsString}`;
  }

  const workstreamsUrl = new URL(`${getConfig().API_URL_BASE}/workstreams`);
  const applicationsUrl = new URL(`${getConfig().API_URL_BASE}/applications`);

  let sections: { [key in SectionName]: SectionData } = {
    [SectionName.APPLIED_TO]: {
      title: 'Workstreams you applied to'
    },
    [SectionName.TO_REVIEW]: {
      title: 'Applications to review'
    },
    [SectionName.PENDING]: {
      title: 'Workstreams pending payment setup'
    },
    [SectionName.ACTIVE]: {
      title: 'Active workstreams'
    },
    [SectionName.ENDED]: {
      title: 'Ended wrkstreams'
    }
  };

  onMount(() => {
    if ($connectedAndLoggedIn && $walletStore.connected) {
      const urls = {
        [SectionName.APPLIED_TO]: buildUrl(workstreamsUrl, {
          applied: 'true',
          state: 'rfa'
        }),
        [SectionName.TO_REVIEW]: buildUrl(applicationsUrl, {
          state: 'waiting',
          toUser: $walletStore.address
        }),
        [SectionName.PENDING]: buildUrl(workstreamsUrl, {
          state: WorkstreamState.PENDING,
          creator: $walletStore.address
        }),
        [SectionName.ACTIVE]: buildUrl(workstreamsUrl, {
          state: WorkstreamState.ACTIVE,
          assignee: $walletStore.address
        }),
        [SectionName.ENDED]: buildUrl(workstreamsUrl, {
          state: WorkstreamState.CLOSED,
          assignee: $walletStore.address
        })
      } as { [key in SectionName]: string };

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
  });

  async function authenticate() {
    locked = true;
    try {
      if (!$walletStore.connected) await walletStore.connect();
      if (!$connectedAndLoggedIn) await authStore.authenticate($walletStore);
    } finally {
      locked = false;
    }
  }

  let applicationFilter = 'all';
</script>

<svelte:head>
  <title>Workstreams · Dashboard</title>
</svelte:head>

<div class="container">
  {#if browser && $authStore.authenticated && $walletStore.connected}
    <div class="sections">
      {#each Object.keys(sections) as sectionName}
        {#if sections[sectionName].data}
          <Section
            title={sections[sectionName].title}
            count={sections[sectionName].data.length}
            >{sections[sectionName].data}</Section
          >
        {/if}
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
</style>
