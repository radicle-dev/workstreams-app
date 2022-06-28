<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { walletStore } from '$lib/stores/wallet/wallet';

  const dispatch = createEventDispatcher();

  let locked: boolean;
  $: metaMaskInstalled = $walletStore.metamaskInstalled;

  async function connect(method: 'metamask' | 'walletconnect') {
    locked = true;

    dispatch('awaitPending', {
      promise: () => walletStore.connect(method),
      message: 'Please connect your wallet and sign the login message…'
    });
  }
</script>

<h1>Connect wallet</h1>
<div class="options">
  <div class="option" on:click={() => connect('walletconnect')}>
    <img
      src="assets/WalletConnect-icon.svg"
      class="icon"
      alt="WalletConnect logo"
    />
    <h3>WalletConnect</h3>
  </div>
  <div class="divider" />
  <div
    class="option"
    class:disabled={metaMaskInstalled === false}
    on:click={metaMaskInstalled && (() => connect('metamask'))}
  >
    <img src="assets/MetaMask-icon.svg" class="icon" alt="MetaMask logo" />
    <h3>MetaMask</h3>
  </div>
</div>

<style>
  .options {
    display: flex;
    width: 100%;
    justify-content: space-around;
    margin-top: 2rem;
  }

  .option {
    width: 40%;
    padding: 1rem;
    border-radius: 1rem;
    transition: background-color 0.15s;
  }

  .option.disabled {
    opacity: 0.5;
  }

  .option:not(.disabled):hover {
    background-color: var(--color-foreground-level-1);
    cursor: pointer;
  }

  .option > img {
    margin-bottom: 0.5rem;
  }

  .divider {
    width: 0.25rem;
    border-radius: 0.125rem;
    background-color: var(--color-foreground-level-2);
  }

  @media only screen and (max-width: 54rem) {
    .options {
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      align-items: center;
    }

    .option {
      width: 100%;
    }

    .divider {
      height: 0.25rem;
      width: 100%;
    }
  }
</style>
