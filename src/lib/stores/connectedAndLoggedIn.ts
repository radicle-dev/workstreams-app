import { derived } from 'svelte/store';
import { authStore } from './auth/auth';
import { walletStore } from './wallet/wallet';

const connectedAndLoggedIn = derived(
  [walletStore, authStore],
  ([$walletStore, $authStore]) =>
    $authStore.authenticated && $walletStore.accounts[0] === $authStore.address
);

export default connectedAndLoggedIn;
