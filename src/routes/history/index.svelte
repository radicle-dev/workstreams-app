<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  import { workstreamsStore } from '$lib/stores/workstreams';
  import HistoryItem from '$lib/components/History/HistoryItem.svelte';
  import { currencyFormat } from '$lib/utils/format';
  import drips from '$lib/stores/drips';
  import history from './history';
  import * as aggregators from './historyItemAggregators';
  import Spinner from 'radicle-design-system/Spinner.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

  const { estimates } = workstreamsStore;

  $: relevantStreams = Object.values($workstreamsStore).filter(
    (ws) => ws.onChainData
  );

  let loading = true;
  let interval: ReturnType<typeof setInterval>;

  $: {
    if (
      $connectedAndLoggedIn &&
      relevantStreams.length > 0 &&
      $estimates.totalBalance
    ) {
      updateHistory();
      loading = false;
      clearInterval(interval);
      interval = setInterval(updateHistory, 1000);
    } else {
      clearInterval(interval);
    }
  }

  onDestroy(() => clearInterval(interval));

  function updateHistory() {
    history
      .setStreams(relevantStreams)
      .add(aggregators.withdrawal)
      .add(aggregators.streamStart)
      .add(aggregators.streamPaused)
      .add(aggregators.streamUnpaused)
      .add(aggregators.streamStartStop)
      .add(aggregators.today)
      .add(aggregators.monthStartInbetween)
      .add(aggregators.streamedInbetween)
      .flush();
  }
</script>

<template>
  {#if $connectedAndLoggedIn}
    <h1>Account history</h1>
    {#if !loading}
      <div in:fly|local={{ y: 10, duration: 300 }} class="stats">
        <div class="key-value">
          <h4>Total earned</h4>
          <p class="amount typo-text-mono-bold">
            +{($estimates.totalBalance &&
              currencyFormat($estimates.totalBalance.wei)) ||
              '…'} DAI
          </p>
        </div>
        <div class="key-value">
          <h4>Withdrawable now</h4>
          <p class="typo-text-mono-bold">
            {($drips.collectable && currencyFormat($drips.collectable.wei)) ||
              '…'} DAI
          </p>
        </div>
      </div>
      {#if $history.length > 0}
        <div in:fly={{ y: 10, duration: 300, delay: 100 }} class="history">
          {#each $history as historyItem}
            <HistoryItem {historyItem} />
          {/each}
        </div>
      {:else}
        <EmptyState
          emoji="👀"
          headerText="No activity yet"
          text="Here's where you'll be able to see a history of all your incoming and outgoing workstreams."
        />
      {/if}
    {:else}
      <div in:fly|local={{ y: 10, duration: 300 }} class="loading">
        <Spinner />
      </div>
    {/if}
  {:else}
    <div
      class="empty-wrapper"
      transition:fly|local={{ y: 10, duration: 300, delay: 100 }}
    >
      <EmptyState
        headerText="Sign in to view your account history"
        text="Here's where you'll be able to see a history of all your incoming and outgoing workstreams."
      />
    </div>
  {/if}
</template>

<style scoped>
  h1 {
    margin-bottom: 3rem;
  }

  .stats {
    display: flex;
    gap: 4rem;
    margin-bottom: 3rem;
  }

  .key-value {
    min-width: 9rem;
  }

  .key-value h4 {
    color: var(--color-foreground-level-5);
    margin-bottom: 0.5rem;
  }

  .key-value p {
    color: var(--color-primary);
    font-size: 1.5rem;
  }

  .history {
    margin-left: -1.5rem;
    width: calc(100% + 2rem);
    flex-direction: column;
    display: flex;
  }

  .loading {
    position: absolute;
    top: 0;
    height: 90vh;
    left: 0;
    right: 0;
    justify-content: center;
    align-items: center;
    display: flex;
  }

  .empty-wrapper {
    position: absolute;
    width: 100vw;
    left: 0;
  }
</style>
