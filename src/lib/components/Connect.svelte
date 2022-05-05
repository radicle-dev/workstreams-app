<script lang="ts">
  import { walletStore } from '$lib/stores/wallet/wallet';
  import Button from 'radicle-design-system/Button.svelte';
  import { fade } from 'svelte/transition';
  import User from '$components/User.svelte';
  import { authStore } from '$lib/stores/auth/auth';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

  let locked: boolean;

  async function logIn() {
    locked = true;
    try {
      if (!$walletStore.connected) await walletStore.connect();
      if (!$connectedAndLoggedIn) await authStore.authenticate($walletStore);
    } finally {
      locked = false;
    }
  }

  async function logOut() {
    walletStore.disconnect();
    authStore.clear();
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
        {#if $walletStore.chainId !== 1}
          <div class="network">⚠️ {$walletStore.provider.network.name}</div>
        {/if}
      </Button>
    </div>
  {:else if locked}
    <Button disabled variant="outline">. . .</Button>
  {:else if !$walletStore.initialized}
    <Button disabled variant="outline">Initializing...</Button>
  {:else if $walletStore.walletPresent === false}
    <Button disabled variant="outline">Install MetaMask to log in</Button>
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

  .network {
    display: flex;
    padding: 0 0.5rem;
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
    height: 1.5rem;
    border-radius: 0.75rem;
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
