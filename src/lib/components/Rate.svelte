<script lang="ts">
  import { roundDayRate } from '$lib/utils/format';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import Tooltip from 'radicle-design-system/Tooltip.svelte';

  export let rate: number;
  export let currency: string;
  export let duration: number | undefined = undefined;
  export let icon: boolean = true;
  export let total: boolean = false;
  export let difference: boolean = false;
</script>

{#if total}
  <Tooltip value={roundDayRate(rate) + ` ${currency.toUpperCase()} / 24h`}>
    <p class="typo-text-bold rate">
      {#if icon}
        <TokenStreams style="fill: var(--color-primary);" />
      {/if}
      {Math.floor(rate * duration)}
      {currency.toUpperCase()}
    </p>
  </Tooltip>
{:else if difference}
  <p class="typo-text-bold rate difference">
    {rate > 0 ? `+ ${roundDayRate(rate)}` : `${roundDayRate(rate)}`}
    {currency.toUpperCase()} <span class="typo-text">/ 24h</span>
  </p>
{:else}
  <p class="typo-text-bold rate">
    {#if icon}
      <TokenStreams style="fill: var(--color-primary);" />
    {/if}
    {roundDayRate(rate)}
    {currency.toUpperCase()} <span class="typo-text">/ 24h</span>
  </p>
{/if}

<style>
  .rate {
    color: var(--color-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .difference {
    color: var(--color-foreground-level-5);
  }
</style>
