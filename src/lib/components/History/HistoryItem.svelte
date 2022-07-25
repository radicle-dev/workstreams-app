<script lang="ts">
  import CollectIcon from 'radicle-design-system/icons/Topup.svelte';
  import {
    HistoryItemType,
    type HistoryItem
  } from '$lib/../routes/history/types';
  import Pause from 'radicle-design-system/icons/Pause.svelte';
  import Cross from 'radicle-design-system/icons/Cross.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import { currencyFormat } from '$lib/utils/format';
  import EarnedInbetweenDropdown from './EarnedInbetweenDropdown.svelte';
  import Rate from '../Rate.svelte';

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

  function isToday(date: Date) {
    const today = new Date();
    return (
      date.getDate() == today.getDate() &&
      date.getMonth() == today.getMonth() &&
      date.getFullYear() == today.getFullYear()
    );
  }
</script>

<template>
  {#if historyItem.type === HistoryItemType.MonthStartInbetween}
    <div class="month-start-inbetween">
      <div class="content">
        <h3 class="title">
          {isToday(historyItem.timestamp)
            ? 'Today'
            : Intl.DateTimeFormat('en-US', {
                month: 'long',
                year: 'numeric'
              }).format(
                new Date(
                  historyItem.timestamp.getFullYear(),
                  historyItem.timestamp.getMonth() - 1
                )
              )}
        </h3>
        <p class="amounts typo-text-small">
          {#if historyItem.meta.earned.streams.length > 0}
            earned <span class="amount typo-text-mono-bold"
              >{currencyFormat(historyItem.meta.earned.total.wei)} DAI</span
            >
            from <EarnedInbetweenDropdown
              amountsEarned={historyItem.meta.earned.streams}
              amountsSpent={[]}
              timeWindow={historyItem.meta.window}
              >{historyItem.meta.earned.streams.length} workstream{historyItem
                .meta.earned.streams.length > 1
                ? 's'
                : ''}</EarnedInbetweenDropdown
            >
            {#if historyItem.meta.spent.streams.length > 0}and{/if}
          {/if}
          {#if historyItem.meta.spent.streams.length > 0}
            streamed <span class="amount typo-text-mono-bold"
              >{currencyFormat(historyItem.meta.spent.total.wei)} DAI</span
            >
            to <EarnedInbetweenDropdown
              amountsEarned={[]}
              amountsSpent={historyItem.meta.spent.streams}
              timeWindow={historyItem.meta.window}
              >{historyItem.meta.spent.streams.length} workstream{historyItem
                .meta.spent.streams.length > 1
                ? 's'
                : ''}</EarnedInbetweenDropdown
            > this month
          {/if}
        </p>
      </div>
      <div class="line" />
    </div>
  {/if}
  {#if historyItem.type === HistoryItemType.StreamedInbetween}
    <div class="streamed-inbetween">
      <div class="line" />
      <div class="content">
        <div class="circle" />
        <p class="amounts typo-text-small">
          {#if historyItem.meta.earned.streams.length > 0}
            earned <span class="amount typo-text-mono-bold"
              >{currencyFormat(historyItem.meta.earned.total.wei)} DAI</span
            >
            from <EarnedInbetweenDropdown
              amountsEarned={historyItem.meta.earned.streams}
              amountsSpent={[]}
              timeWindow={historyItem.meta.window}
              >{historyItem.meta.earned.streams.length} workstream{historyItem
                .meta.earned.streams.length > 1
                ? 's'
                : ''}</EarnedInbetweenDropdown
            >
            {#if historyItem.meta.spent.streams.length > 0}and{/if}
          {/if}
          {#if historyItem.meta.spent.streams.length > 0}
            streamed <span class="amount typo-text-mono-bold"
              >{currencyFormat(historyItem.meta.spent.total.wei)} DAI</span
            >
            to <EarnedInbetweenDropdown
              amountsEarned={[]}
              amountsSpent={historyItem.meta.spent.streams}
              timeWindow={historyItem.meta.window}
              >{historyItem.meta.spent.streams.length} workstream{historyItem
                .meta.spent.streams.length > 1
                ? 's'
                : ''}</EarnedInbetweenDropdown
            >
          {/if}
          in {historyItem.meta.secs} seconds
        </p>
      </div>
    </div>
  {/if}
  {#if historyItem.type === HistoryItemType.StreamStart}
    <div class="history-card">
      <div class="icon primary">
        <Plus style="fill: var(--color-primary)" />
      </div>
      <h4>
        {historyItem.meta.workstream.direction === 'incoming'
          ? 'Started earning for'
          : 'Started outgoing stream'}
        <a
          class="highlight"
          href={`/workstream/${historyItem.meta.workstream.data.id}`}
          >{historyItem.meta.workstream.data.title}</a
        >
      </h4>
      <p class="date">{formatDate(historyItem.timestamp)}</p>
      <p class="potential amount typo-text-mono-bold">
        <Rate
          ratePerSecond={historyItem.meta.workstream.onChainData.amtPerSec}
          total={historyItem.meta.workstream.data.total}
        />
      </p>
    </div>
  {/if}
  {#if historyItem.type === HistoryItemType.Withdrawal}
    <div class="history-card">
      <div class="icon primary">
        <CollectIcon style="fill: var(--color-primary)" />
      </div>
      <h4><span class="highlight">Withdrawal</span></h4>
      <p class="date">{formatDate(historyItem.timestamp)}</p>
      <p class="amount typo-text-mono-bold">
        -{currencyFormat(historyItem.meta.amount.wei)} DAI
      </p>
    </div>
  {/if}
  {#if historyItem.type === HistoryItemType.StreamOutOfFunds}
    <div class="history-card">
      <div class="icon">
        <Cross style="fill: var(--color-foreground-level-5)" />
      </div>
      <h4>
        {historyItem.meta.workstream.direction} stream
        <a
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
        {historyItem.meta.workstream.direction} stream
        <a
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
        {historyItem.meta.workstream.direction} stream
        <a
          class="highlight"
          href={`/workstream/${historyItem.meta.workstream.data.id}`}
          >{historyItem.meta.workstream.data.title}</a
        >
        topped up with
        <span class="typo-text-mono-bold"
          >{currencyFormat(historyItem.meta.amount.wei)} DAI</span
        >
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
    margin-bottom: 1rem;
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
  }

  h4 {
    font-weight: normal;
    color: var(--color-foreground-level-6);
  }

  h4::first-letter {
    text-transform: capitalize;
  }

  h4 .highlight {
    font-weight: 600;
    color: var(--color-foreground);
  }

  a:hover {
    text-decoration: underline;
  }

  .date {
    flex: 1;
  }

  .streamed-inbetween {
    position: relative;
    margin-top: -1rem;
  }

  .streamed-inbetween > .content {
    margin: 2rem 0rem 2rem 4.5rem;
  }

  .amounts:first-letter {
    text-transform: capitalize;
  }

  .amounts .amount {
    font-size: 13px;
  }

  .streamed-inbetween .circle {
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

  .streamed-inbetween > .line {
    position: absolute;
    left: 2.5rem;
    height: 100%;
    width: 0.125rem;
    background-color: var(--color-foreground-level-2);
  }

  .month-start-inbetween {
    position: relative;
    margin-top: -1rem;
    justify-content: center;
  }

  .month-start-inbetween > .line {
    position: absolute;
    top: 0;
    left: 2.5rem;
    height: 100%;
    z-index: -1;
    width: 0.125rem;
    background: linear-gradient(
      180deg,
      var(--color-foreground-level-2),
      var(--color-background) 2.5rem,
      var(--color-background) calc(100% - 0.75rem),
      var(--color-foreground-level-2)
    );
  }

  .month-start-inbetween:first-child .line {
    background: linear-gradient(
      180deg,
      var(--color-background),
      var(--color-background) calc(100% - 0.75rem),
      var(--color-foreground-level-2)
    );
  }

  .month-start-inbetween > .content {
    margin: 3rem 1.5rem 2rem 1.5rem;
    display: flex;
    justify-content: space-between;
  }

  @media only screen and (max-width: 54rem) {
    .history-card {
      padding: 1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .month-start-inbetween > .content {
      margin: 3rem 1rem 2rem 1rem;
      flex-direction: column;
      gap: 0.5rem;
    }

    .icon {
      flex-shrink: 0;
    }

    .streamed-inbetween > .content {
      margin: 2rem 0rem 2rem 3.5rem;
    }

    .streamed-inbetween > .line {
      left: 2rem;
    }

    .streamed-inbetween .circle {
      left: 1.55rem;
    }

    .month-start-inbetween > .line {
      left: 2rem;
    }
  }
</style>
