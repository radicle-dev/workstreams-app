<script lang="ts">
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';

  export let rate: number;
  export let currency: string;
  export let difference: boolean = false;
  export let icon: boolean = true;
</script>

<p class="typo-text-bold rate" class:difference>
  {#if difference}
    <span>+ </span>
  {:else if icon}
    <TokenStreams style="fill: var(--color-primary);" />
  {/if}
  {Math.floor(rate)}
  {currency.toUpperCase()} <span class="typo-text">/ 24h</span>
</p>

<style>
  .rate {
    color: var(--color-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .rate.difference {
    color: var(--color-negative);
  }
</style>
