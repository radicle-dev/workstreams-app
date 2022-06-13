<script lang="ts">
  import type { Money } from '$lib/stores/workstreams/types';

  import { currencyFormat } from '$lib/utils/format';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import Tooltip from 'radicle-design-system/Tooltip.svelte';

  export let ratePerSecond: Money;
  export let total: Money;
  export let showTotal = false;
  export let icon = true;
</script>

{#if showTotal}
  <Tooltip
    position="top"
    value={currencyFormat(ratePerSecond.wei * BigInt(86400)) +
      ` ${ratePerSecond.currency.toUpperCase()} / 24h`}
  >
    <p class="typo-text-mono-bold rate">
      {#if icon}
        <TokenStreams style="fill: var(--color-primary);" />
      {/if}
      {currencyFormat(total)}
      {ratePerSecond.currency.toUpperCase()}
    </p>
  </Tooltip>
{:else}
  <p class="typo-text-bold rate">
    {#if icon}
      <TokenStreams style="fill: var(--color-primary);" />
    {/if}
    <span class="typo-text-mono-bold">
      {currencyFormat(ratePerSecond.wei * BigInt(86400))}
      {ratePerSecond.currency.toUpperCase()}</span
    > <span class="typo-text-mono">/ 24h</span>
  </p>
{/if}

<style>
  .rate {
    color: var(--color-primary);
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
</style>
