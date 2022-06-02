import { browser } from '$app/env';
import { ethers } from 'ethers';
import { get, writable } from 'svelte/store';

export type WalletData = {
  initialized: boolean;
  walletPresent?: boolean;
  connected: boolean;
  chainId?: number;
  accounts: string[];
  provider?: ethers.providers.Web3Provider;
};

function checkForWallet(): boolean {
  return typeof window.ethereum !== 'undefined';
}

export const walletStore = (() => {
  const walletStore = writable<WalletData>({
    initialized: false,
    connected: false,
    accounts: []
  });

  const { subscribe, update, set } = walletStore;

  if (browser) {
    initialize();
    if (checkForWallet()) registerListeners();
  }

  async function initialize() {
    if (!checkForWallet()) {
      set({
        initialized: true,
        walletPresent: false,
        connected: false,
        accounts: []
      });

      return;
    }

    const chainId: string = await window.ethereum.request({
      method: 'eth_chainId'
    });

    const parsedChainId = parseInt(chainId, 16);

    const provider = new ethers.providers.Web3Provider(
      window.ethereum,
      parsedChainId
    );

    const accounts: string[] = await window.ethereum.request({
      method: 'eth_accounts'
    });

    if (accounts.length > 0) {
      set({
        initialized: true,
        walletPresent: true,
        connected: true,
        chainId: parseInt(chainId, 16),
        accounts,
        provider
      });
    } else {
      set({
        initialized: true,
        walletPresent: true,
        connected: false,
        chainId: parseInt(chainId, 16),
        provider,
        accounts: []
      });
    }
  }

  function registerListeners() {
    // Handle the user switching their network.
    window.ethereum.on('chainChanged', (chainId: string) => {
      const parsedChainId = parseInt(chainId, 16);

      update((wd) => ({
        ...wd,
        chainId: parseInt(chainId, 16),
        provider: new ethers.providers.Web3Provider(
          window.ethereum,
          parsedChainId
        )
      }));

      location.reload();
    });

    // Handle a new account being created or account being removed.
    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
      update((wd) => ({
        ...wd,
        accounts
      }));
    });
  }

  async function connect() {
    const wd = get(walletStore);

    if (!wd.initialized)
      throw new Error('Wallet store is not yet initialized. Please wait...');

    if (!wd.walletPresent)
      throw new Error('No wallet is installed. Cannot connect.');

    // Bring up Metamask account picker if the wallet has not yet been connected.
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [
        {
          eth_accounts: {}
        }
      ]
    });

    const accounts: string[] = await window.ethereum.request({
      method: 'eth_accounts'
    });

    const chainId: string = await window.ethereum.request({
      method: 'eth_chainId'
    });

    set({
      connected: true,
      initialized: true,
      walletPresent: true,
      provider: wd.provider,
      accounts,
      chainId: parseInt(chainId, 16)
    });
  }

  function disconnect() {
    update((wd) => ({
      ...wd,
      accounts: [],
      initialized: true,
      walletPresent: true,
      connected: false
    }));
  }

  return {
    subscribe,
    connect,
    disconnect
  };
})();
