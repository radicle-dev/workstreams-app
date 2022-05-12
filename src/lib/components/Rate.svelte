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
    value={currencyFormat(ratePerSecond) +
      ` ${ratePerSecond.currency.toUpperCase()} / 24h`}
  >
    <p class="typo-text-bold rate">
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
    {currencyFormat(ratePerSecond)}
    {ratePerSecond.currency.toUpperCase()} <span class="typo-text">/ 24h</span>
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
