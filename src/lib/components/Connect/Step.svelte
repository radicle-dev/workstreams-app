<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { authStore } from '$lib/stores/auth/auth';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import Button from 'radicle-design-system/Button.svelte';
  import { get } from 'svelte/store';

  const dispatch = createEventDispatcher();

  let locked: boolean;

  async function connect(method: 'metamask' | 'walletconnect') {
    locked = true;

    let waitFor: () => Promise<void>;

    switch (method) {
      case 'metamask': {
        waitFor = async () => {
          await walletStore.connectMetamask();
          if (!$connectedAndLoggedIn)
            await authStore.authenticate($walletStore);
        };
        break;
      }
      case 'walletconnect': {
        waitFor = async () => {
          console.log('waitFor');
          await walletStore.connectWalletConnect();
          if (!$connectedAndLoggedIn)
            await authStore.authenticate(get(walletStore));
        };
        break;
      }
    }

    dispatch('awaitPending', {
      promise: waitFor,
      message: 'Please connect your wallet and sign the message…'
    });
  }
</script>

<Button disabled={locked} on:click={() => connect('metamask')}
  >Connect MetaMask</Button
>
<Button disabled={locked} on:click={() => connect('walletconnect')}
  >Connect WalletConnect</Button
>
