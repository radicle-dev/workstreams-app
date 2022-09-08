<script lang="ts">
  import { fly } from 'svelte/transition';

  import { page } from '$app/stores';

  import * as modal from '$lib/utils/modal';

  import Connect from '$components/Connect/Button.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import CreateModal from './CreateModal.svelte';
  import { headerContent } from '$lib/stores/headerContent';
  import BalanceButton from './BalanceButton.svelte';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import scroll from '$lib/stores/scroll';
  import isMobile from '$lib/stores/isMobile';
  import Plus from 'radicle-design-system/icons/Plus.svelte';

  $: scrolledDown = $scroll.pos > 0;
  $: hide =
    $scroll.direction === 'down' &&
    ($isMobile.isMobile || !$headerContent.component);
  $: showCustomHeaderContent =
    $headerContent.headerContentShown !== undefined
      ? $headerContent.headerContentShown
      : scrolledDown;
  $: onDashboard =
    $page.url.pathname.includes('dashboard') || $page.url.pathname === '/';
  $: onHistory = $page.url.pathname.includes('history');

  const animate = (node: Element, args: { y: number; enable: boolean }) =>
    args.enable
      ? fly(node, {
          y: $scroll.direction === 'up' ? -args.y : args.y,
          duration: 300
        })
      : {};
</script>

<header class:hide class:withShadow={scrolledDown && !hide}>
  <div class="inner">
    {#if !$isMobile.isMobile && showCustomHeaderContent && $headerContent.component}
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
          <a sveltekit:prefetch href="/" class:active={onDashboard}>Dashboard</a
          >
          <a sveltekit:prefetch href="/history" class:active={onHistory}
            >History</a
          >
        </nav>
        <div class="buttons">
          {#if $walletStore.ready && onDashboard}
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
          {#if $walletStore.ready}
            <div class="balance-button">
              <BalanceButton />
            </div>
          {/if}
          <div class="user">
            <Connect />
          </div>
        </div>
      </div>
      {#if onDashboard && $walletStore.ready}
        <div
          transition:fly={{ y: 10, duration: 300 }}
          class="mobile-create-workstream-button"
          on:click={() => modal.show(CreateModal)}
        >
          <Plus
            style="fill: var(--color-background); height: 2rem; width: 2rem;"
          />
        </div>
      {/if}
    {/if}
  </div>
</header>

<style>
  header {
    top: 0;
    left: 0;
    right: 0;
    height: 4.5rem;
    box-sizing: border-box;
    background-color: var(--color-background);
    z-index: 1;
    position: fixed;
    transition: box-shadow 0.3s, transform 0.3s;
  }

  .content {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 1rem;
  }

  header.hide {
    transform: translateY(-4.5rem);
  }

  header.withShadow {
    box-shadow: var(--elevation-low);
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

  .mobile-create-workstream-button {
    display: none;
  }

  @media only screen and (max-width: 54rem) {
    header {
      top: initial;
      bottom: 0;
      border-radius: 0.5rem 0.5rem 0 0;
      box-shadow: var(--elevation-low);
    }

    header.hide {
      transform: translateY(0);
    }

    .content {
      padding: 1rem 0.75rem 1rem 0.5rem;
    }

    .balance-button,
    .create-button {
      display: none;
    }

    .mobile-create-workstream-button {
      display: block;
      position: fixed;
      right: 0.5rem;
      bottom: 5rem;
      height: 4rem;
      width: 4rem;
      border-radius: 2rem;
      background-color: var(--color-primary);
      color: var(--color-background);
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: var(--elevation-medium);
    }
  }
</style>
