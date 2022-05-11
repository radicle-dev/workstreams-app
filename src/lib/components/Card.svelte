<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let style: string | undefined = undefined;
  export let hoverable = true;
  let hover = false;
</script>

<div
  on:click={() => dispatch('click')}
  on:focus={() => dispatch('focus')}
  on:mouseenter={() => (hover = true)}
  on:mouseleave={() => (hover = false)}
  class="card"
  {style}
  class:hover={hoverable && hover}
>
  <slot name="top" />
  <slot name="bottom" />
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem;
    justify-content: space-between;
    transition: all 0.2s;
    gap: 1rem;
  }
  .card.hover {
    cursor: pointer;
    border: 1px solid var(--color-foreground-level-3);
  }
</style>
