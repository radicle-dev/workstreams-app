<script lang="ts">
  import TopUpIcon from 'radicle-design-system/icons/Topup.svelte';
  import {
    HistoryItemType,
    type HistoryItem
  } from '$lib/../routes/history/types';
  import Pause from 'radicle-design-system/icons/Pause.svelte';
  import Cross from 'radicle-design-system/icons/Cross.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import { currencyFormat } from '$lib/utils/format';
  import EarnedInbetweenDropdown from './EarnedInbetweenDropdown.svelte';

  export let historyItem: HistoryItem;

  function formatDate(date: Date) {
    return Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: 'numeric',
      second: '2-digit'
    }).format(date);
  }
</script>

<template>
  {#if historyItem.type === HistoryItemType.EarnedInbetween && historyItem.meta.earned}
    <div class="history-inbetween">
      <div class="line" />
      <div class="content">
        <div class="circle" />
        <p class="typo-text-small">
          Earned <span class="amount typo-text-mono-bold"
            >{currencyFormat(historyItem.meta.total.wei)} DAI</span
          >
          from <EarnedInbetweenDropdown
            amountsEarned={historyItem.meta.earned}
            window={historyItem.meta.window}
            >{historyItem.meta.earned.length} workstreams</EarnedInbetweenDropdown
          > in {historyItem.meta.secs} seconds
        </p>
      </div>
    </div>
  {/if}
  {#if historyItem.type === HistoryItemType.StreamStart}
    <div class="history-card">
      <div class="icon primary">
        <TopUpIcon style="fill: var(--color-primary)" />
      </div>
      <h4>
        Stream <a
          class="highlight"
          href={`/workstream/${historyItem.meta.workstream.data.id}`}
          >{historyItem.meta.workstream.data.title}</a
        > set up and started
      </h4>
      <p>{formatDate(historyItem.timestamp)}</p>
    </div>
  {/if}
  {#if historyItem.type === HistoryItemType.StreamOutOfFunds}
    <div class="history-card">
      <div class="icon">
        <Cross style="fill: var(--color-foreground-level-5)" />
      </div>
      <h4>
        Stream <a
          class="highlight"
          href={`/workstream/${historyItem.meta.workstream.data.id}`}
          >{historyItem.meta.workstream.data.title}</a
        > ran out of funds
      </h4>
      <p>{formatDate(historyItem.timestamp)}</p>
    </div>
  {/if}
  {#if historyItem.type === HistoryItemType.StreamPaused}
    <div class="history-card">
      <div class="icon">
        <Pause style="fill: var(--color-foreground-level-5)" />
      </div>
      <h4>
        Stream <a
          class="highlight"
          href={`/workstream/${historyItem.meta.workstream.data.id}`}
          >{historyItem.meta.workstream.data.title}</a
        > paused
      </h4>
      <p>{formatDate(historyItem.timestamp)}</p>
    </div>
  {/if}
  {#if historyItem.type === HistoryItemType.StreamToppedUp}
    <div class="history-card">
      <div class="icon primary">
        <Plus style="fill: var(--color-primary)" />
      </div>
      <h4>
        Stream <a
          class="highlight"
          href={`/workstream/${historyItem.meta.workstream.data.id}`}
          >{historyItem.meta.workstream.data.title}</a
        > topped up
      </h4>
      <p>{formatDate(historyItem.timestamp)}</p>
    </div>
  {/if}
  {#if historyItem.type === HistoryItemType.StreamUnpaused}
    <div class="history-card">
      <div class="icon primary">
        <Plus style="fill: var(--color-primary)" />
      </div>
      <h4>
        Stream <a
          class="highlight"
          href={`/workstream/${historyItem.meta.workstream.data.id}`}
          >{historyItem.meta.workstream.data.title}</a
        > unpaused
      </h4>
      <p>{formatDate(historyItem.timestamp)}</p>
    </div>
  {/if}
</template>

<style scoped>
  .history-card {
    margin-top: 1rem;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    outline: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem;
  }

  .icon {
    height: 2rem;
    width: 2rem;
    border-radius: 1rem;
    display: flex;
    background-color: var(--color-foreground-level-2);
    justify-content: center;
    align-items: center;
  }

  .icon.primary {
    background-color: var(--color-primary-level-1);
  }

  p {
    color: var(--color-foreground-level-5);
  }

  .amount {
    color: var(--color-primary);
    font-size: 13px;
  }

  h4 {
    font-weight: normal;
    color: var(--color-foreground-level-6);
  }

  h4 .highlight {
    font-weight: 600;
    color: var(--color-foreground);
  }

  a:hover {
    text-decoration: underline;
  }

  .history-inbetween {
    position: relative;
    margin-bottom: -1rem;
  }

  .history-inbetween .content {
    margin: 2rem 0rem 2rem 4.5rem;
  }

  .history-inbetween .circle {
    position: absolute;
    left: 2.05rem;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 0.5rem;
    height: 1rem;
    width: 1rem;
    border: 0.125rem solid var(--color-foreground-level-2);
    background-color: var(--color-background);
  }

  .history-inbetween .line {
    position: absolute;
    left: 2.5rem;
    height: 100%;
    width: 0.125rem;
    background-color: var(--color-foreground-level-2);
  }
</style>
