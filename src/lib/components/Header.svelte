<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import * as modal from '$lib/utils/modal';

  import Connect from '$components/Connect.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import CreateModal from './CreateModal.svelte';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';
  import { browser } from '$app/env';
  import { headerContent } from '$lib/stores/headerContent';
  import drips from '$lib/stores/drips';

  let scrolledDown = false;
  let scrollPos = 0;
  let scrollingDown = false;
  let collectable: string | undefined;

  $: hide = scrollingDown && !$headerContent.component;
  $: showCustomHeaderContent =
    $headerContent.headerContentShown !== undefined
      ? $headerContent.headerContentShown
      : scrolledDown;
  $: onExplore =
    $page.url.pathname.includes('explore') || $page.url.pathname === '/';
  $: onDashboard = $page.url.pathname.includes('dashboard');

  const animate = (node: Element, args: { y: number; enable: boolean }) =>
    args.enable
      ? fly(node, { y: !scrollingDown ? -args.y : args.y, duration: 300 })
      : undefined;

  if (browser) {
    updateScrollPos();
  }

  onMount(async () => {
    if (browser) {
      window.addEventListener('scroll', updateScrollPos);

      collectable = await drips.getCollectable();
    }
  });

  function updateScrollPos() {
    scrollingDown = window.scrollY > scrollPos;
    scrolledDown = window.scrollY !== 0;
    scrollPos = window.scrollY;
  }
</script>

<header
  class:hide
  style:box-shadow={scrolledDown && !hide ? 'var(--elevation-low)' : ''}
>
  <div class="inner">
    {#if showCustomHeaderContent && $headerContent.component}
      <div
        transition:animate={{ enable: !!headerContent, y: 20 }}
        class="content page"
      >
        <svelte:component
          this={$headerContent.component}
          {...$headerContent.props}
        />
      </div>
    {:else}
      <div
        transition:animate={{ enable: !!$headerContent.component, y: 20 }}
        class="content default"
      >
        <nav>
          <a sveltekit:prefetch href="/" class:active={onExplore}>Explore</a>
          <a
            sveltekit:prefetch
            href="/dashboard"
            on:click={() => goto(`/dashboard`)}
            class:active={onDashboard}>Dashboard</a
          >
        </nav>
        <div class="buttons">
          {#if $connectedAndLoggedIn && onDashboard}
            <div
              in:fly={{ y: 10, duration: 300, delay: 300 }}
              out:fly={{ y: 10, duration: 300 }}
              class="create-button"
            >
              <Button
                icon={TokenStreams}
                on:click={() => modal.show(CreateModal)}
                >Create Workstream</Button
              >
            </div>
          {/if}
          <div class="user">
            Collectable: {collectable}
            <Connect />
          </div>
        </div>
      </div>
    {/if}
  </div>
</header>

<div class="spacer" />

<style>
  header {
    top: 0;
    left: 0;
    right: 0;
    height: 4.5rem;
    box-sizing: border-box;
    background-color: var(--color-background);
    z-index: 10;
    position: fixed;
    transition: box-shadow 0.3s, transform 0.3s;
  }

  .content {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 1rem 2rem;
  }

  header.hide {
    transform: translateY(-4.5rem);
  }

  .content.default {
    display: flex;
    gap: 3rem;
    align-items: center;
  }

  .content.page {
    height: 100%;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
  }

  .spacer {
    height: 6rem;
  }

  nav {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 0.5rem;
  }
  nav > a {
    color: var(--color-foreground-level-5);
    padding: 0.5rem 1rem;
    text-decoration: none;
    font-weight: 600;
    border-radius: 0.5rem;
    transition: all 0.3s;
  }
  nav > a:hover {
    background-color: var(--color-foreground-level-2);
  }
  nav > a.active {
    color: var(--color-foreground);
    background-color: var(--color-foreground-level-2);
  }

  .user {
    display: flex;
    gap: 0.75rem;
  }
</style>
