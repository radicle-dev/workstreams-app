<script lang="ts">
  export let rate: number;
  export let currency: string;
</script>

<p class="typo-text-bold rate">
  {rate > 0 ? `+ ${Math.floor(rate)}` : `${Math.floor(rate)}`}
  {currency.toUpperCase()} <span class="typo-text">/ 24h</span>
</p>

<style>
  .rate {
    color: var(--color-foreground-level-5);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
