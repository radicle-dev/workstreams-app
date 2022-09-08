<script lang="ts">
  import type { Money } from '$lib/stores/workstreams';

  import { currencyFormat, timeframeFormat } from '$lib/utils/format';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import Tooltip from 'radicle-design-system/Tooltip.svelte';

  export let ratePerSecond: Money;
  export let total: Money;
  export let showTotal = false;
  export let durationDays: number | undefined = undefined;
  export let icon = true;

  $: durationString = durationDays && timeframeFormat(durationDays);
</script>

{#if showTotal}
  <Tooltip
    position="top"
    value={currencyFormat(ratePerSecond.wei * BigInt(86400)) +
      ` ${ratePerSecond.currency.toUpperCase()} / 24h`}
  >
    <p class="typo-text-bold rate">
      {#if icon}
        <TokenStreams style="fill: var(--color-primary);" />
      {/if}
      {currencyFormat(total)}
      {ratePerSecond.currency.toUpperCase()}
      {#if durationDays}
        <span class="typo-text time-unit">for {durationString}</span>
      {/if}
    </p>
  </Tooltip>
{:else}
  <p class="typo-text-bold rate">
    {#if icon}
      <TokenStreams style="fill: var(--color-primary);" />
    {/if}
    <span class="typo-text-bold">
      {currencyFormat(ratePerSecond.wei * BigInt(86400))}
      {ratePerSecond.currency.toUpperCase()}</span
    > <span class="typo-text time-unit">per day</span>
  </p>
{/if}

<style>
  .rate {
    color: var(--color-primary);
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .time-unit {
    color: var(--color-foreground-level-5);
  }
</style>
