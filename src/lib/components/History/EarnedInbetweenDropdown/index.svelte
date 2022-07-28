<script lang="ts">
  import { fly } from 'svelte/transition';

  import type { EnrichedWorkstream } from '$lib/stores/workstreams';
  import type { Money } from '$lib/stores/workstreams/types';
  import { onMount } from 'svelte';
  import convertRemToPixels from '$lib/utils/remToPx';
  import isMobile from '$lib/stores/isMobile';
  import * as modal from '$lib/utils/modal';
  import Content from './Content.svelte';
  import ContentModal from './ContentModal.svelte';

  export let amountsEarned: { workstream: EnrichedWorkstream; amount: Money }[];
  export let timeWindow: { from: Date; to: Date };
  export let amountsSpent: { workstream: EnrichedWorkstream; amount: Money }[];

  let hover = false;
  let drodpdownAlignment: 'left' | 'right' = 'left';
  let hoverElem: HTMLElement | undefined;

  $: useModal = $isMobile.isMobile;

  onMount(() => {
    const spaceOnRight =
      window.innerWidth - hoverElem.getBoundingClientRect().right;
    if (spaceOnRight < convertRemToPixels(33)) {
      drodpdownAlignment = 'right';
    }
  });

  function handleHover(mouseover: boolean) {
    if (!useModal) {
      hover = mouseover;
    }
  }

  function handleClick() {
    if (useModal) {
      modal.show(ContentModal, undefined, {
        amountsEarned,
        timeWindow,
        amountsSpent
      });
    }
  }
</script>

<div
  on:mouseleave={() => handleHover(false)}
  on:mouseenter={() => handleHover(true)}
  on:click={handleClick}
  class="text"
>
  <span bind:this={hoverElem}>
    <slot />
  </span>
  {#if hover}
    <div class="puffer" />
    <div
      class="earned-inbetween-dropdown"
      class:drop-right={drodpdownAlignment === 'right'}
      transition:fly|local={{ y: 10, duration: 300 }}
    >
      <Content {amountsEarned} {amountsSpent} {timeWindow} />
    </div>
  {/if}
</div>

<style>
  .text {
    display: inline-block;
    position: relative;
    color: var(--color-foreground-level-6);
  }

  .text:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .earned-inbetween-dropdown {
    position: absolute;
    top: calc(100% + 0.25rem);
    padding: 1rem;
    border-radius: 1rem;
    left: -0.5rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-high);
    width: 32rem;
    z-index: 10;
    cursor: default;
  }

  .earned-inbetween-dropdown.drop-right {
    left: calc(100% - 31.5rem);
  }

  .puffer {
    position: absolute;
    left: 0;
    top: 100%;
    width: 100%;
    height: 0.25rem;
  }
</style>
