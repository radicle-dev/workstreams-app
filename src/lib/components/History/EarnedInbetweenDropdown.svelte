<script lang="ts">
  import { fly } from 'svelte/transition';

  import type { EnrichedWorkstream } from '$lib/stores/workstreams';
  import type { Money } from '$lib/stores/workstreams/types';
  import { currencyFormat } from '$lib/utils/format';
  import Plus from 'radicle-design-system/icons/Plus.svelte';

  export let amountsEarned: { workstream: EnrichedWorkstream; amount: Money }[];
  export let window: { from: Date; to: Date };

  let hover = false;

  function formatDate(date: Date) {
    return Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: 'numeric',
      second: '2-digit'
    }).format(date);
  }
</script>

<template>
  <div
    on:mouseleave={() => (hover = false)}
    on:mouseenter={() => (hover = true)}
    class="text"
  >
    <slot />
    {#if hover}
      <div class="puffer" />
      <div
        class="earned-inbetween-dropdown"
        transition:fly|local={{ y: 10, duration: 300 }}
      >
        <div class="amounts">
          <p class="typo-text-small">
            Earned between <span class="typo-text-small-bold"
              >{formatDate(window.from)}</span
            >
            and
            <span class="typo-text-small-bold">{formatDate(window.to)}</span>
          </p>
          {#each amountsEarned as amountEarned}
            <div class="amount-earned">
              <div class="icon">
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
        </div>
      </div>
    {/if}
  </div>
</template>

<style scoped>
  .amount-earned {
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
    background-color: var(--color-positive-level-1);
    display: flex;
    justify-content: center;
    align-items: center;
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
