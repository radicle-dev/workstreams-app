<script lang="ts">
  import { currencyFormat } from '$lib/utils/format';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import Tooltip from 'radicle-design-system/Tooltip.svelte';

  export let rate: number;
  export let currency: string;
  export let duration: number | undefined = undefined;
  export let icon: boolean = true;
  export let total: boolean = false;
</script>

{#if total}
  <Tooltip value={currencyFormat(rate) + ` ${currency.toUpperCase()} / 24h`}>
    <p class="typo-text-bold rate">
      {#if icon}
        <TokenStreams style="fill: var(--color-primary);" />
      {/if}
      {currencyFormat(rate * duration)}
      {currency.toUpperCase()}
    </p>
  </Tooltip>
{:else}
  <p class="typo-text-bold rate">
    {#if icon}
      <TokenStreams style="fill: var(--color-primary);" />
    {/if}
    {currencyFormat(rate)}
    {currency.toUpperCase()} <span class="typo-text">/ 24h</span>
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
