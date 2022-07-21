<script lang="ts">
  import { fly } from 'svelte/transition';

  import type { EnrichedWorkstream } from '$lib/stores/workstreams';
  import type { Money } from '$lib/stores/workstreams/types';
  import { currencyFormat } from '$lib/utils/format';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import Minus from 'radicle-design-system/icons/Minus.svelte';
  import { onMount } from 'svelte';
  import convertRemToPixels from '$lib/utils/remToPx';

  export let amountsEarned: { workstream: EnrichedWorkstream; amount: Money }[];
  export let amountsSpent: { workstream: EnrichedWorkstream; amount: Money }[];
  export let timeWindow: { from: Date; to: Date };

  let hover = false;
  let drodpdownAlignemt: 'left' | 'right' = 'left';
  let hoverElem: HTMLElement | undefined;

  function formatDate(date: Date) {
    return Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: 'numeric',
      second: '2-digit'
    }).format(date);
  }

  onMount(() => {
    const spaceOnRight =
      window.innerWidth - hoverElem.getBoundingClientRect().right;
    if (spaceOnRight < convertRemToPixels(33)) {
      drodpdownAlignemt = 'right';
    }
  });
</script>

<template>
  <div
    on:mouseleave={() => (hover = false)}
    on:mouseenter={() => (hover = true)}
    class="text"
  >
    <span bind:this={hoverElem}>
      <slot />
    </span>
    {#if hover}
      <div class="puffer" />
      <div
        class="earned-inbetween-dropdown"
        class:drop-right={drodpdownAlignemt === 'right'}
        transition:fly|local={{ y: 10, duration: 300 }}
      >
        <div class="amounts">
          {#if amountsEarned.length > 0}
            <p class="typo-text-small">
              Earned between <span class="typo-text-small-bold"
                >{formatDate(timeWindow.from)}</span
              >
              and
              <span class="typo-text-small-bold"
                >{formatDate(timeWindow.to)}</span
              >
            </p>
          {/if}
          {#each amountsEarned as amountEarned}
            <div class="amount">
              <div class="icon positive">
                <Plus style="fill: var(--color-positive)" />
              </div>
              <p class="title typo-text-bold">
                {amountEarned.workstream.data.title}
              </p>
              <p class="amount typo-text-mono-bold">
                +{currencyFormat(amountEarned.amount.wei)} DAI
              </p>
            </div>
          {/each}
          {#if amountsSpent.length > 0}
            <p class="typo-text-small">
              Streamed between <span class="typo-text-small-bold"
                >{formatDate(timeWindow.from)}</span
              >
              and
              <span class="typo-text-small-bold"
                >{formatDate(timeWindow.to)}</span
              >
            </p>
          {/if}
          {#each amountsSpent as amountSpent}
            <div class="amount">
              <div class="icon negative">
                <Minus style="fill: var(--color-negative)" />
              </div>
              <p class="title typo-text-bold">
                {amountSpent.workstream.data.title}
              </p>
              <p class="amount typo-text-mono-bold">
                -{currencyFormat(amountSpent.amount.wei)} DAI
              </p>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</template>

<style scoped>
  .amount {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .title {
    color: var(--color-foreground);
    flex: 1;
  }

  .amount {
    color: var(--color-primary);
    font-size: 14px;
  }

  .icon {
    height: 2rem;
    width: 2rem;
    border-radius: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon.positive {
    background-color: var(--color-positive-level-1);
  }

  .icon.negative {
    background-color: var(--color-negative-level-1);
  }

  .text {
    display: inline-block;
    position: relative;
    color: var(--color-foreground-level-6);
  }

  .text:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .earned-inbetween-dropdown {
    position: absolute;
    top: calc(100% + 0.25rem);
    padding: 1rem;
    border-radius: 1rem;
    left: -0.5rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-high);
    width: 32rem;
    z-index: 10;
    cursor: default;
  }

  .earned-inbetween-dropdown.drop-right {
    left: calc(100% - 31.5rem);
  }

  .puffer {
    position: absolute;
    left: 0;
    top: 100%;
    width: 100%;
    height: 0.25rem;
  }

  .amounts {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
