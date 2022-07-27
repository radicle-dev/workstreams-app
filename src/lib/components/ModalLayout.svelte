<script lang="ts">
  import * as modal from '$lib/utils/modal';
  import Cross from 'radicle-design-system/icons/Cross.svelte';
  import { fade, fly } from 'svelte/transition';

  const modalStore = modal.store;

  $: store = $modalStore;

  const clickOutside = () => {
    modal.hide();
  };

  const pressEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      modal.hide();
    }
  };
</script>

<svelte:window on:keydown={pressEscapeKey} />

<!--
  Removing this wrapping div breaks everything.
  See https://github.com/sveltejs/svelte/issues/6037
-->
<div>
  {#if store.overlay !== null}
    <div class="modal-layout" data-cy="modal-layout">
      <div
        class="overlay"
        transition:fade|local={{ duration: 200 }}
        on:click={clickOutside}
      />
      <div class="content">
        <div
          class="modal-wrapper"
          transition:fly|local={{ y: 10, duration: 300 }}
        >
          {#if store.hideable}
            <div class="close-button" on:click={modal.hide}>
              <Cross />
            </div>
          {/if}
          <svelte:component
            this={store.overlay.modalComponent}
            {...store.overlay.modalComponentProps}
          />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .modal-layout {
    height: 100%;
    width: 100%;
    position: fixed;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: scroll;
  }
  .overlay {
    background-color: rgba(0, 0, 0, 0.75);
    height: 100%;
    width: 100%;
    position: fixed;
  }

  .modal-wrapper {
    position: relative;
  }

  .close-button {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    background-color: var(--color-foreground-level-2);
    height: 2rem;
    width: 2rem;
    border-radius: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    cursor: pointer;
  }
  .content {
    z-index: 200;
    margin: auto;
  }
</style>
