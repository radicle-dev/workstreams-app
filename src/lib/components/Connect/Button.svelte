<script lang="ts">
  import * as modal from '$lib/utils/modal';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import Button from 'radicle-design-system/Button.svelte';
  import { fade } from 'svelte/transition';
  import User from '$components/User.svelte';
  import { authStore } from '$lib/stores/auth/auth';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';
  import { workstreamsStore } from '$lib/stores/workstreams';
  import drips from '$lib/stores/drips';
  import LoadingDots from '../LoadingDots.svelte';
  import ConnectStep from './Step.svelte';
  import StepperModal from '../StepperModal/index.svelte';

  let locked: boolean;

  async function logIn() {
    locked = true;
    modal.show(StepperModal, () => (locked = false), {
      steps: [ConnectStep]
    });
  }

  $: {
    if ($authStore.authenticated && $walletStore.connected) {
      connectStores();
    }
  }

  async function connectStores() {
    const { provider } = $walletStore;

    await drips.connect(provider);
    await workstreamsStore.connect(provider, $drips.cycle);
  }

  async function logOut() {
    walletStore.disconnect();
    drips.disconnect();
    authStore.clear();
    workstreamsStore.clear();
  }

  let hover = false;
</script>

<div class="connect-button-wrapper" on:mouseleave={() => (hover = false)}>
  {#if $connectedAndLoggedIn}
    {#if hover}
      <div
        on:click={logOut}
        transition:fade={{ duration: 100 }}
        class="log-out-overlay"
      >
        <h4>Log out</h4>
      </div>
    {/if}
    <div>
      <Button variant="outline" on:mouseenter={() => (hover = true)}>
        <User address={$authStore.address} />
      </Button>
    </div>
  {:else if locked}
    <Button disabled variant="outline">
      <LoadingDots />
    </Button>
  {:else if !$walletStore.initialized}
    <Button disabled variant="outline">Initializing...</Button>
  {:else}
    <Button on:click={() => logIn()} variant="outline"
      >Sign in with Ethereum</Button
    >
  {/if}
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
