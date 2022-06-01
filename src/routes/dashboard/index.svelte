<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';

  import { walletStore } from '$lib/stores/wallet/wallet';
  import { authStore } from '$lib/stores/auth/auth';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

  import { WorkstreamState } from '$lib/stores/workstreams/types';

  import EmptyState from '$lib/components/EmptyState.svelte';
  import Section from '$lib/components/Section.svelte';
  import WorkstreamCard from '$lib/components/WorkstreamCard/index.svelte';
  import { currencyFormat } from '$lib/utils/format';
  import {
    workstreamsStore,
    type EnrichedWorkstream
  } from '$lib/stores/workstreams';
  import { goto } from '$app/navigation';
  import Spinner from 'radicle-design-system/Spinner.svelte';

  const estimates = workstreamsStore.estimates;

  let locked: boolean;

  enum SectionName {
    APPLIED_TO = 'appliedTo',
    PENDING_SETUP = 'pending_setup',
    APPLICATIONS_TO_REVIEW = 'toReview',
    ACTIVE = 'active',
    OUTBOUND_ACTIVE = 'outboundActive',
    CREATED = 'created',
    ENDED = 'ended'
  }

  interface SectionData {
    title: string;
    workstreams: { [wsId: string]: EnrichedWorkstream };
  }

  let loading = true;

  $: {
    if ($connectedAndLoggedIn) {
      loading = true;

      const fetches = [
        workstreamsStore.getWorkstreams({ applied: 'true' }),
        workstreamsStore.getWorkstreams({
          createdBy: $walletStore.accounts[0]
        }),
        workstreamsStore.getWorkstreams({
          assignedTo: $walletStore.accounts[0]
        })
      ];

      Promise.all(fetches).then(() => (loading = false));
    }
  }

  $: workstreams = $workstreamsStore;

  function filterObject<T>(
    obj: { [key: string]: T },
    callback: (val: T, key: string) => boolean
  ) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, val]) => callback(val, key))
    );
  }

  $: address = $walletStore.accounts[0];

  type Sections = { [key in SectionName]: SectionData };

  /*
    The order of sections in this map determines their ordering
    on-screen — and with that their relative "importance".
  */
  $: sections = {
    [SectionName.APPLICATIONS_TO_REVIEW]: {
      title: 'Applications to review',
      workstreams: filterObject(workstreams, (ws) => {
        return (
          ws.data.applicationsToReview?.length > 0 &&
          ws.data.creator === address
        );
      })
    },
    [SectionName.PENDING_SETUP]: {
      title: 'Workstreams pending payment setup',
      workstreams: filterObject(workstreams, (ws) => {
        return (
          ws.data.state === WorkstreamState.PENDING &&
          (ws.data.creator === address ||
            ws.data.acceptedApplication === address)
        );
      })
    },
    [SectionName.APPLIED_TO]: {
      title: 'Workstreams you applied to',
      workstreams: filterObject(workstreams, (ws) => {
        return (
          ws.data.state === WorkstreamState.RFA &&
          ws.data.applicants?.includes(address)
        );
      })
    },
    [SectionName.CREATED]: {
      title: 'Waiting for applications',
      workstreams: filterObject(workstreams, (ws) => {
        return (
          ws.data.state === WorkstreamState.RFA &&
          ws.data.applicationsToReview?.length === 0 &&
          ws.data.creator === address
        );
      })
    },
    [SectionName.ACTIVE]: {
      title: 'Incoming funds',
      workstreams: filterObject(workstreams, (ws) => {
        return (
          ws.data.state === WorkstreamState.ACTIVE &&
          ws.onChainData &&
          ws.data.acceptedApplication === address
        );
      })
    },
    [SectionName.ENDED]: {
      title: 'Ended workstreams',
      workstreams: filterObject(workstreams, (ws) => {
        return ws.data.state === WorkstreamState.CLOSED;
      })
    },
    [SectionName.OUTBOUND_ACTIVE]: {
      title: 'Outgoing funds',
      workstreams: filterObject(workstreams, (ws) => {
        return (
          ws.data.state === WorkstreamState.ACTIVE &&
          ws.onChainData &&
          ws.data.creator === address
        );
      })
    }
  } as Sections;

  $: {
    if (!$connectedAndLoggedIn) {
      clearSectionData();
    }
  }

  function clearSectionData() {
    Object.keys(sections).forEach((sectionName) => {
      sections[sectionName].data = undefined;
    });
  }

  function calculateStreamTotal(enrichedWorkstreams: {
    [key: string]: EnrichedWorkstream;
  }) {
    const totalWeiPerSec = Object.entries(enrichedWorkstreams).reduce<bigint>(
      (acc, [id, ws]) => {
        return $estimates.streams[id]?.currentlyStreaming
          ? acc + ws.onChainData.amtPerSec.wei
          : acc;
      },
      BigInt(0)
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

  $: sectionsToDisplay = filterObject(
    sections,
    (s) => Object.keys(s.workstreams).length > 0
  );
</script>

<svelte:head>
  <title>Workstreams · Dashboard</title>
</svelte:head>

<div class="container">
  {#if $authStore.authenticated && $walletStore.connected}
    <div transition:fly|local={{ y: 10, duration: 300 }} class="sections">
      {#each Object.entries(sectionsToDisplay) as [key, section] (key)}
        <div
          class="section"
          animate:flip={{ duration: 300 }}
          transition:fly|local={{ y: 10, duration: 300 }}
        >
          <Section
            title={section.title}
            count={Object.keys(section.workstreams).length}
          >
            <div slot="subtitle" class="earning-per-day">
              {#if key === SectionName.ACTIVE}
                <TokenStreams />
                <p>
                  You are earning <span class="typo-text-bold"
                    >{calculateStreamTotal(section.workstreams)}
                    DAI</span
                  > per day
                </p>
              {:else if key === SectionName.OUTBOUND_ACTIVE}
                <TokenStreams />
                <p>
                  You are streaming <span class="typo-text-bold"
                    >{calculateStreamTotal(section.workstreams)}
                    DAI</span
                  > per day
                </p>
              {/if}
            </div>
            <div slot="content" class="workstreams">
              {#each Object.values(section.workstreams) as workstream}
                <WorkstreamCard enrichedWorkstream={workstream} />
              {/each}
            </div>
          </Section>
        </div>
      {/each}
      {#if loading}
        <div transition:fly|local={{ y: 10, duration: 300 }} class="spinner">
          <Spinner />
        </div>
      {:else if Object.keys(sectionsToDisplay).length === 0}
        <div
          transition:fly|local={{ y: 10, duration: 300 }}
          class="empty-wrapper"
        >
          <EmptyState
            headerText="Nothing to see here"
            text="This is where the Workstreams you created or are contributing to show up."
            primaryActionText="Discover workstreams"
            on:primaryAction={() => goto('/')}
          />
        </div>
      {/if}
    </div>
  {:else}
    <div transition:fly|local={{ y: 10, duration: 300 }} class="empty-wrapper">
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
  }

  .empty-wrapper {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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
