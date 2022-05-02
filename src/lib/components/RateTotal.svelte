<script lang="ts">
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import Tooltip from 'radicle-design-system/Tooltip.svelte';

  export let rate: number;
  export let duration: number;
  export let currency: string;
  export let icon: boolean = true;
</script>

<Tooltip value={Math.floor(rate) + ` ${currency.toUpperCase()} / 24h`}>
  <p class="typo-text-bold rate">
    {#if icon}
      <TokenStreams style="fill: var(--color-primary);" />
    {/if}
    {Math.floor(rate * duration)}
    {currency.toUpperCase()}
  </p>
</Tooltip>

<style>
  .rate {
    color: var(--color-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
