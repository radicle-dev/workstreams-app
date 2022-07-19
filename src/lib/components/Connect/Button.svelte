<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { CupertinoPane } from 'cupertino-pane';

  import * as modal from '$lib/utils/modal';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import Button from 'radicle-design-system/Button.svelte';
  import { fade } from 'svelte/transition';
  import User from '$components/User.svelte';
  import LoadingDots from '../LoadingDots.svelte';
  import StepperModal from '../StepperModal/index.svelte';
  import ChooseWallet from './steps/ChooseWallet.svelte';
  import LinkSafe from './steps/LinkSafe.svelte';
  import clearStores from '$lib/stores/utils/clearStores';
  import connectStores from '$lib/stores/utils/connectStores';
  import isMobile from '$lib/stores/isMobile';
  import scroll from '$lib/stores/scroll';

  export let onClick: () => void | undefined = undefined;

  let locked: boolean;
  let pane: CupertinoPane;

  async function logIn() {
    locked = true;
    modal.show(
      StepperModal,
      () => {
        locked = false;
        hover = false;
      },
      {
        steps: [ChooseWallet, LinkSafe]
      }
    );
  }

  onMount(async () => {
    await tick();

    pane = new CupertinoPane('.mobile-bottom-sheet', {
      parentElement: 'body',
      backdrop: true,
      fastSwipeClose: true
    });

    pane.on('onWillPresent', () => {
      scroll.lock();
    });

    pane.on('onDidDismiss', () => {
      scroll.unlock();
    });

    if ($walletStore.ready) {
      const { provider: localProvider, safe } = $walletStore;
      const provider = safe?.provider || localProvider;

      await connectStores(provider);
    }

    return () => {
      pane.destroy();
    };
  });

  async function logOut() {
    pane.hide();
    await walletStore.disconnect();
    clearStores();
  }

  function openBottomSheet() {
    pane.present({ animate: true });
  }

  let hover = false;
</script>

<div
  class="connect-button-wrapper"
  on:mouseenter={() => (hover = true)}
  on:mouseleave={() => (hover = false)}
>
  {#if $walletStore.ready}
    {#if hover && !$isMobile.isMobile}
      <div
        on:click={onClick || logOut}
        transition:fade={{ duration: 100 }}
        class="log-out-overlay"
      >
        <h4>Log out</h4>
      </div>
    {/if}
    <div>
      {#if $isMobile.isMobile}
        <div class="connect-button-mobile" on:click={openBottomSheet}>
          <User
            noLink
            address={$walletStore.address}
            showAddress={false}
            largeAvatar
          />
        </div>
      {:else}
        <Button variant="outline">
          <User address={$walletStore.address} />
        </Button>
      {/if}
    </div>
  {:else if locked}
    <Button disabled variant="outline">
      <LoadingDots />
    </Button>
  {:else}
    <Button on:click={() => logIn()} variant="outline"
      >Sign in{$isMobile.isMobile ? '' : ' with Ethereum'}</Button
    >
  {/if}
</div>

<div class="mobile-bottom-sheet">
  <Button on:click={logOut}>Log out</Button>
</div>

<style>
  .connect-button-wrapper {
    position: relative;
  }

  .log-out-overlay {
    position: absolute;
    top: 0;
    background-color: var(--color-background);
    left: 0;
    z-index: 5;
    height: calc(100% - 4px);
    width: calc(100% - 4px);
    margin: 2px;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
</style>
