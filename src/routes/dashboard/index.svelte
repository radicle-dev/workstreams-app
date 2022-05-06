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
  import { currencyFormat } from '$lib/utils/format';

  let locked: boolean;

  enum SectionName {
    APPLIED_TO = 'appliedTo',
    PENDING_SETUP = 'pending_setup',
    WAITING_SETUP = 'waiting_setup',
    APPLICATIONS_TO_REVIEW = 'toReview',
    ACTIVE = 'active',
    CREATED = 'created',
    ENDED = 'ended'
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

  /*
    The order of sections in this map determines their ordering
    on-screen — and with that their relative "importance".
  */
  let sections: { [key in SectionName]: SectionData } = {
    [SectionName.APPLICATIONS_TO_REVIEW]: {
      title: 'Applications to review'
    },
    [SectionName.PENDING_SETUP]: {
      title: 'Workstreams pending payment setup'
    },
    [SectionName.WAITING_SETUP]: {
      title: 'Workstreams waiting for payment setup'
    },
    [SectionName.APPLIED_TO]: {
      title: 'Workstreams you applied to'
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

  let loading = true;

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
        createdBy: $walletStore.accounts[0],
        hasApplicationsToReview: 'false'
      }),
      [SectionName.PENDING_SETUP]: buildUrl({
        state: WorkstreamState.PENDING,
        createdBy: $walletStore.accounts[0]
      }),
      [SectionName.WAITING_SETUP]: buildUrl({
        state: WorkstreamState.PENDING,
        assignedTo: $walletStore.accounts[0]
      }),
      [SectionName.APPLICATIONS_TO_REVIEW]: buildUrl({
        createdBy: $walletStore.accounts[0],
        hasApplicationsToReview: 'true'
      }),
      [SectionName.ACTIVE]: buildUrl({
        state: WorkstreamState.ACTIVE,
        assignedTo: $walletStore.accounts[0]
      }),
      [SectionName.ENDED]: buildUrl({
        state: WorkstreamState.CLOSED,
        assignedTo: $walletStore.accounts[0]
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
            loading = false;
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
    let totalWeiPerSec = BigInt(0);
    workstreams.forEach(
      (ws) => (totalWeiPerSec = totalWeiPerSec + ws.ratePerSecond.wei)
    );

    const totalWeiPerDay = totalWeiPerSec * BigInt(86400);

    return currencyFormat(totalWeiPerDay);
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
                <WorkstreamCard {workstream} />
              {/each}
            </div>
          </Section>
        </div>
      {/each}
      {#if loading}
        <div transition:fly={{ y: 10, duration: 300 }} class="spinner">
          <Spinner />
        </div>
      {/if}
    </div>
  {:else}
    <div transition:fly={{ y: 10, duration: 300 }} class="empty-wrapper">
      <EmptyState
        headerText="Sign in to view your Workstreams"
        text="This is where the Workstreams you created or are contributing to show up."
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
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }
</style>
