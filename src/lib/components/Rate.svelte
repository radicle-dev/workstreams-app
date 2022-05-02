<script lang="ts">
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';

  export let rate: number;
  export let currency: string;
  export let difference: boolean = false;
  export let icon: boolean = true;

  let differenceRate: string | undefined = undefined;

  if (difference) {
    differenceRate = rate > 0 ? `+ ${Math.floor(rate)}` : `${Math.floor(rate)}`;
  }
</script>

<p class="typo-text-bold rate" class:difference>
  {#if icon && !difference}
    <TokenStreams style="fill: var(--color-primary);" />
  {/if}
  {#if difference}
    {differenceRate}
  {:else}
    {Math.floor(rate)}
  {/if}
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
    color: var(--color-foreground-level-5);
  }
</style>
