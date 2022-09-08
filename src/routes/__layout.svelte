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
  import scroll from '$lib/stores/scroll';
  import cupertinoPane from '$lib/stores/cupertinoPane';

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
    cupertinoPane.attach();

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

    scroll.attach();

    return () => {
      window.removeEventListener(
        'change',
        colorSchemeListener as (event: Event) => void
      );
      cupertinoPane.detach();
      scroll.detach();
      cupertinoPane.detach();
    };
  });
</script>

<ModalLayout />
<div class="cupertino-pane">
  <div class="inner">
    <div class="dragger" />
    {#if $cupertinoPane.component}
      <div class="content">
        <svelte:component
          this={$cupertinoPane.component}
          {...$cupertinoPane.props}
        />
      </div>
    {/if}
  </div>
</div>
{#if $walletStore}
  <div class="wrapper" class:loading={$navigating}>
    <Header />
    <main>
      <slot />
    </main>
  </div>
  {#if $walletStore.network}
    {#if $walletStore.network.chainId === 4}
      <div class="network"><span />{$walletStore.network.name}</div>
    {:else if $walletStore.network.chainId !== 1}
      <div class="network error"><span />Unsupported Network</div>
    {/if}
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

  .cupertino-pane {
    display: none;
    background-color: var(--color-background);
    border-radius: 1rem 1rem 0 0;
  }

  .cupertino-pane > .inner {
    display: flex;
    padding-top: 0.5rem;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
  }

  .cupertino-pane > .inner > .content {
    width: 100%;
    padding: 0.5rem 1rem;
  }

  .cupertino-pane > .inner > .dragger {
    height: 0.3rem;
    width: 2rem;
    background-color: var(--color-foreground-level-3);
    border-radius: 0.25rem;
  }

  :global(.cupertino-pane-wrapper .pane) {
    padding-top: 0;
  }

  @media only screen and (max-width: 54rem) {
    .wrapper {
      padding: 0.5rem 0.5rem 5rem 0.5rem;
    }

    .network {
      display: none;
    }
  }
</style>
