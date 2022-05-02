<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import Spinner from 'radicle-design-system/Spinner.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';

  import { walletStore } from '$lib/stores/wallet/wallet';
  import { authStore } from '$lib/stores/auth/auth';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';
  import { getConfig } from '$lib/config';

  import {
    WorkstreamState,
    type Workstream
  } from '$lib/stores/workstreams/types';

  import EmptyState from '$lib/components/EmptyState.svelte';
  import Section from '$lib/components/dashboard/Section.svelte';
  import WorkstreamCard from '$lib/components/WorkstreamCard.svelte';

  let locked: boolean;

  enum SectionName {
    APPLIED_TO = 'appliedTo',
    PENDING = 'pending',
    APPLICATIONS_TO_REVIEW = 'toReview',
    ACTIVE = 'active',
    CREATED = 'created',
    ENDED = 'ended',
    LOADING = 'loading'
  }

  interface SectionData {
    title: string;
    fetched?: true;
    display?: boolean;
    workstreams?: Workstream[];
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
    },
    [SectionName.LOADING]: {
      title: 'Loading',
      display: true,
      fetched: true
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

    const urls: { [key in SectionName]?: string } = {
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
          sections[sectionName] = {
            ...sections[sectionName],
            fetched: true,
            display: response.status === 200,
            workstreams: response.status === 200 && (await response.json())
          };

          if (
            Object.keys(sections).every(
              (sectionName) => sections[sectionName].fetched
            )
          ) {
            sections[SectionName.LOADING].display = false;
          }
        }
      );
    });
  }

  function clearSectionData() {
    Object.keys(sections).forEach((sectionName) => {
      sections[sectionName].data = undefined;
    });
  }

  function calculateStreamTotal(workstreams: Workstream[]) {
    let totalRate = 0;
    workstreams.forEach((ws) => (totalRate = totalRate + ws.payment.rate));

    return Math.round(totalRate);
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
  {#if $authStore.authenticated && $walletStore.connected}
    <div transition:fly={{ y: 10, duration: 300 }} class="sections">
      {#each Object.keys(sections).filter((sn) => !!sections[sn].display) as sectionName (sectionName)}
        <div
          class="section"
          animate:flip={{ duration: 300 }}
          transition:fly={{ y: 10, duration: 300 }}
        >
          {#if sectionName === SectionName.LOADING}
            <div class="spinner">
              <Spinner />
            </div>
          {:else}
            <Section
              title={sections[sectionName].title}
              count={sections[sectionName].workstreams.length}
            >
              <div slot="subtitle" class="earning-per-day">
                {#if sectionName === SectionName.ACTIVE}
                  <TokenStreams />
                  <p>
                    You are earning <span class="typo-text-bold"
                      >{calculateStreamTotal(sections[sectionName].workstreams)}
                      DAI</span
                    > per day
                  </p>
                {/if}
              </div>
              <div slot="content" class="workstreams">
                {#each sections[sectionName].workstreams as workstream}
                  <div class="workstream"><WorkstreamCard {workstream} /></div>
                {/each}
              </div>
            </Section>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <div transition:fly={{ y: 10, duration: 300 }} class="empty-wrapper">
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
    padding: 3rem 0;
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

  .earning-per-day {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    color: var(--color-foreground-level-6);
  }

  .spinner {
    height: 8rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
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
