<script lang="ts">
  import { onMount } from 'svelte';

  import 'radicle-design-system/static/reset.css';
  import 'radicle-design-system/static/global.css';
  import 'radicle-design-system/static/colors.css';
  import 'radicle-design-system/static/elevation.css';
  import 'radicle-design-system/static/typography.css';

  import { browser } from '$app/env';
  import { navigating } from '$app/stores';
  import Header from '$components/Header.svelte';
  import ModalLayout from '$components/ModalLayout.svelte';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import tick from '$lib/stores/tick';

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

  onMount(async () => {
    await walletStore.initialize();

    prefersDarkThemes = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    const colorSchemeListener = (event: MediaQueryListEvent) => {
      prefersDarkThemes = event.matches;
    };

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', colorSchemeListener);

    if (!tick.isRunning()) tick.start();

    return () => {
      window.removeEventListener('change', colorSchemeListener);
    };
  });
</script>

<ModalLayout />
{#if $walletStore}
  <div class="wrapper" class:loading={$navigating}>
    <Header />
    <main>
      <slot />
    </main>
  </div>
  {#if $walletStore.network.chainId === 4}
    <div class="network"><span />{$walletStore.provider.network.name}</div>
  {:else if $walletStore.network.chainId !== 1}
    <div class="network error"><span />Unsupported Network</div>
  {/if}
{/if}

<style>
  :global(html, body) {
    /* All design system style overrides go here. */
    display: block;
  }

  :global(p) {
    color: var(--color-foreground-level-6);
  }

  .wrapper {
    max-width: 90rem;
    margin: 0 auto;
    padding: 6rem 1rem 3rem 1rem;
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
  }

  @media only screen and (max-width: 54rem) {
    .wrapper {
      padding: 6rem 0.5rem 2rem 0.5rem;
    }
  }
</style>
