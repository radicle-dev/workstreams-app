import { derived } from 'svelte/store';
import { authStore } from './auth/auth';
import { walletStore } from './wallet/wallet';

const connectedAndLoggedIn = derived(
  [walletStore, authStore],
  ([$walletStore, $authStore]) =>
    $walletStore.connected &&
    $authStore.authenticated &&
    $walletStore.address === $authStore.address
);

export default connectedAndLoggedIn;
