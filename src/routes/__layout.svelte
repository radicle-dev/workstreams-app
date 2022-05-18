<script context="module">
  /* eslint-disable */
  export const load = async ({ url }) => ({ props: { url } });
  /* eslint-enable */
</script>

<script lang="ts">
  import { browser } from '$app/env';

  import { navigating } from '$app/stores';
  import Header from '$components/Header.svelte';
  import ModalLayout from '$components/ModalLayout.svelte';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import { onMount } from 'svelte';
  import '../app.css';

  export let url: string;

  enum Theme {
    DARK = 'dark',
    LIGHT = 'light'
  }

  let prefersDarkThemes = false;

  $: {
    if (browser) {
      if (prefersDarkThemes) {
        document.documentElement.setAttribute('data-theme', Theme.DARK);
      } else {
        document.documentElement.setAttribute('data-theme', Theme.LIGHT);
      }
    }
  }

  /*
    We should wait for the wallet store to be initialized in order to
    be sure that we know the right chain when mounting components.
  */
  $: initialized = $walletStore.initialized;

  onMount(() => {
    if (browser) {
      prefersDarkThemes = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (event) => {
          prefersDarkThemes = event.matches;
        });
    }
  });
</script>

<ModalLayout />
{#if initialized}
  <div class="wrapper" class:loading={$navigating}>
    <Header />
    <main>
      <slot />
    </main>
  </div>
  {#if $walletStore.chainId === 4}
    <div class="network"><span />{$walletStore.provider.network.name}</div>
  {:else if $walletStore.chainId !== 1}
    <div class="network error"><span />Unsupported Network</div>
  {/if}
{/if}

<style>
  .wrapper {
    height: 100vh;
    max-width: 90rem;
    min-width: 40rem;
    margin: 0 auto;
    padding: 1.5rem;
    transition: opacity 0.3s;
  }

  .network {
    position: fixed;
    background-color: var(--color-caution-level-1);
    color: var(--color-caution);
    border-radius: 2rem;
    padding: 0.5rem 1rem;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .error {
    background-color: var(--color-negative-level-1);
    color: var(--color-negative);
  }

  .network > span {
    display: block;
    height: 0.375rem;
    width: 0.375rem;
    border-radius: 50%;
    background-color: var(--color-caution);
  }

  .error > span {
    background-color: var(--color-negative);
  }

  .wrapper.loading {
    opacity: 0.3;
  }

  main {
    display: flex;
    flex-direction: column;
    margin: 1rem 0 4rem;
  }
</style>
