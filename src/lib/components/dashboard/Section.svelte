<script lang="ts">
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';

  export let title: string;
  export let earningPerDay: number | undefined = undefined;
  export let count: number | undefined = undefined;
</script>

<div class="section">
  <div class="headline">
    <div class="title">
      <h2>{title}</h2>
      {#if count}
        <div class="count"><h3>{count}</h3></div>
      {/if}
    </div>
    {#if earningPerDay}
      <div class="earning-per-day">
        <TokenStreams />
        <p>
          You are earning <span class="typo-text-bold">{earningPerDay} DAI</span
          > / day
        </p>
      </div>
    {/if}
  </div>
  <slot />
</div>

<style>
  .section {
    display: flex;
    gap: 2rem;
    flex-direction: column;
  }
  .headline {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .title {
    display: flex;
    gap: 0.5rem;
  }

  .title > .count {
    height: 32px;
    min-width: 32px;
    border-radius: 16px;
    background-color: var(--color-foreground-level-2);
    color: var(--color-foreground-level-6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem;
  }

  .earning-per-day {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    color: var(--color-foreground-level-6);
  }
</style>
