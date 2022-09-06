<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';

  import { walletStore } from '$lib/stores/wallet/wallet';

  import { WorkstreamState } from '$lib/stores/workstreams/types';

  import EmptyState from '$lib/components/EmptyState.svelte';
  import Section from '$lib/components/Section.svelte';
  import WorkstreamCard from '$lib/components/WorkstreamCard.svelte';
  import { currencyFormat } from '$lib/utils/format';
  import {
    workstreamsStore,
    type EnrichedWorkstream
  } from '$lib/stores/workstreams';
  import Spinner from 'radicle-design-system/Spinner.svelte';
  import { onMount } from 'svelte';

  const estimates = workstreamsStore.estimates;

  enum SectionName {
    APPLIED_TO = 'appliedTo',
    PENDING_SETUP = 'pending_setup',
    ACTIVE = 'active',
    OUTBOUND_ACTIVE = 'outboundActive',
    ENDED = 'ended'
  }

  interface SectionData {
    title: string;
    workstreams: { [wsId: string]: EnrichedWorkstream };
  }

  onMount(workstreamsStore.refreshRelevantStreams);

  $: workstreams = $workstreamsStore.workstreams;

  function filterObject<T>(
    obj: { [key: string]: T },
    callback: (val: T, key: string) => boolean
  ) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, val]) => callback(val, key))
    );
  }

  $: address = $walletStore.address;

  type Sections = { [key in SectionName]: SectionData };

  /*
    The order of sections in this map determines their ordering
    on-screen — and with that their relative "importance".
  */
  $: sections = {
    [SectionName.PENDING_SETUP]: {
      title: 'Workstreams pending payment setup',
      workstreams: filterObject(workstreams, (ws) => {
        return (
          ws.data.state === WorkstreamState.ACTIVE &&
          !ws.onChainData?.streamSetUp &&
          (ws.data.creator === address ||
            ws.data.acceptedApplication === address)
        );
      })
    },
    [SectionName.APPLIED_TO]: {
      title: 'Workstreams you applied to',
      workstreams: filterObject(workstreams, (ws) => {
        return Boolean(
          ws.data.state === WorkstreamState.RFA &&
            address &&
            ws.data.applicants?.includes(address)
        );
      })
    },
    [SectionName.ACTIVE]: {
      title: 'Incoming funds',
      workstreams: filterObject(workstreams, (ws) => {
        return Boolean(
          ws.data.state === WorkstreamState.ACTIVE &&
            ws.onChainData?.streamSetUp &&
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
        return Boolean(
          ws.data.state === WorkstreamState.ACTIVE &&
            ws.onChainData?.streamSetUp &&
            ws.data.creator === address
        );
      })
    }
  } as Sections;

  $: incomingTotal = calculateStreamTotal(
    filterObject($workstreamsStore.workstreams, (ws) => {
      return (
        ws.data.acceptedApplication === $walletStore.address &&
        $estimates.workstreams[ws.data.id]?.currentlyStreaming
      );
    })
  );

  $: outgoingTotal = calculateStreamTotal(
    filterObject($workstreamsStore.workstreams, (ws) => {
      return (
        ws.data.creator === $walletStore.address &&
        $estimates.workstreams[ws.data.id]?.currentlyStreaming
      );
    })
  );

  function calculateStreamTotal(enrichedWorkstreams: {
    [key: string]: EnrichedWorkstream;
  }) {
    const totalWeiPerSec = Object.entries(enrichedWorkstreams).reduce<bigint>(
      (acc, [id, ws]) => {
        return $estimates.workstreams[id]?.currentlyStreaming
          ? acc + (ws.onChainData?.amtPerSec.wei || BigInt(0))
          : acc;
      },
      BigInt(0)
    );

    const totalWeiPerDay = totalWeiPerSec * BigInt(86400);

    return currencyFormat(totalWeiPerDay);
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
  {#if $walletStore.ready}
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
                    >{incomingTotal}
                    DAI</span
                  > per day
                </p>
              {:else if key === SectionName.OUTBOUND_ACTIVE}
                <TokenStreams />
                <p>
                  You are streaming <span class="typo-text-bold"
                    >{outgoingTotal}
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
      {#if $workstreamsStore.fetchStatus.relevantStreamsFetching}
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
          />
        </div>
      {/if}
    </div>
  {:else}
    <div transition:fly|local={{ y: 10, duration: 300 }} class="empty-wrapper">
      <EmptyState
        headerText="Sign in to view your Workstreams"
        text="This is where the Workstreams you created or are contributing to show up."
      />
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 75rem;
    margin: 0 auto;
    width: 100%;
    padding: 1.5rem 0 4.5rem 0;
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

  @media only screen and (max-width: 54rem) {
    .workstreams {
      grid-template-columns: minmax(0, 1fr);
      gap: 0.5rem;
    }
  }
</style>
