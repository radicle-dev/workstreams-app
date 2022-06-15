<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { walletStore } from '$lib/stores/wallet/wallet';
  import Button from 'radicle-design-system/Button.svelte';

  const dispatch = createEventDispatcher();

  let locked: boolean;

  async function connect(method: 'metamask' | 'walletconnect') {
    locked = true;

    dispatch('awaitPending', {
      promise: () => walletStore.connect(method),
      message: 'Please connect your wallet and sign the login message…'
    });
  }
</script>

<Button
  disabled={locked || $walletStore.metamaskInstalled === false}
  on:click={() => connect('metamask')}>Connect MetaMask</Button
>
<Button disabled={locked} on:click={() => connect('walletconnect')}
  >Connect WalletConnect</Button
>
