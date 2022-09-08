<script lang="ts">
  import Button from 'radicle-design-system/Button.svelte';
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';

  import * as modal from '$lib/utils/modal';

  const dispatch = createEventDispatcher();

  export let pending: () => Promise<void> | undefined;
  export let pendingMessage: string | undefined;

  let error: unknown | undefined;

  onMount(async () => {
    if (pending) {
      modal.setHideable(false);
      try {
        await pending();
        dispatch('continue');
      } catch (e) {
        error = e;
      } finally {
        modal.setHideable(true);
      }
    }
  });

  function isError(e: unknown): e is Error {
    return Object.prototype.toString.call(e) === '[object Error]';
  }
</script>

<div class="wait-tx">
  {#if error}
    <p>An error occured:</p>
    {isError(error) ? error.message : 'Unknown error'}
    <Button on:click={() => dispatch('goBack')}>Try again</Button>
  {:else}
    <svg
      width="134"
      height="134"
      viewBox="0 0 134 134"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="66" cy="68" r="64" stroke="#C5D1DB" stroke-width="4" />
      <path
        class="spin"
        d="M130 68C130 32.6538 101.346 4 66 4"
        stroke="#5555FF"
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <p>{pendingMessage ?? 'Waiting for your transaction to be confirmed…'}</p>
  {/if}
</div>

<style>
  .wait-tx {
    padding: 2rem 0;
  }

  p {
    color: var(--color-foreground-level-5);
  }

  svg {
    overflow: visible;
    margin-bottom: 2rem;
  }

  .spin {
    animation: rotate 2s infinite linear;
    transform-origin: 66px;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(365deg);
    }
  }
</style>
