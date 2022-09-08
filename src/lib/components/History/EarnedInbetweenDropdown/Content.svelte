<script lang="ts">
  import type { EnrichedWorkstream } from '$lib/stores/workstreams';
  import type { Money } from '$lib/stores/workstreams';
  import { currencyFormat } from '$lib/utils/format';
  import Minus from 'radicle-design-system/icons/Minus.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';

  export let amountsEarned: { workstream: EnrichedWorkstream; amount: Money }[];
  export let timeWindow: { from: Date; to: Date };
  export let amountsSpent: { workstream: EnrichedWorkstream; amount: Money }[];

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

<div class="amounts">
  {#if amountsEarned.length > 0}
    <p class="typo-text-small">
      Earned between <span class="typo-text-small-bold"
        >{formatDate(timeWindow.from)}</span
      >
      and
      <span class="typo-text-small-bold">{formatDate(timeWindow.to)}</span>
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
      <span class="typo-text-small-bold">{formatDate(timeWindow.to)}</span>
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

<style>
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

  .amounts {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: left;
  }
</style>
