<script lang="ts">
  import ChevronRight from 'radicle-design-system/icons/ChevronRight.svelte';
  import type { SvelteComponent } from 'svelte';

  export let title: string;
  export let disabled = false;
  export let subtitle: string | undefined = undefined;
  export let icon: typeof SvelteComponent | undefined = undefined;
  export let onClick: () => void = () => undefined;
</script>

<div
  class:disabled
  class="account-sheet-item-wrapper"
  on:click={!disabled && (() => onClick())}
>
  <slot name="left">
    <div class="icon-wrapper">
      {#if icon}<svelte:component
          this={icon}
          style="fill: var(--color-primary)"
        />{/if}
    </div>
  </slot>
  <div class="description">
    <h4>{title}</h4>
    {#if subtitle}<p>{subtitle}</p>{/if}
  </div>
  <slot name="right">
    <ChevronRight />
  </slot>
</div>

<style>
  .account-sheet-item-wrapper {
    display: flex;
    cursor: pointer;
    gap: 0.5rem;
    align-items: center;
  }

  .account-sheet-item-wrapper.disabled {
    opacity: 0.5;
  }

  .icon-wrapper {
    height: 3rem;
    width: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-primary-level-1);
    border-radius: 1.5rem;
  }

  .description {
    flex: 1;
  }

  .description > h4 {
    color: var(--color-foreground-level-6);
  }

  .description > p {
    color: var(--color-foreground-level-5);
  }
</style>
