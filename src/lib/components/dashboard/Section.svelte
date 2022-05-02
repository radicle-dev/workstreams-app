<script lang="ts">
  export let title: string;
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
    <slot name="subtitle" />
  </div>
  <slot name="content" />
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
    padding-left: 1.5rem;
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
</style>
