// https://github.com/vitejs/vite/issues/7257#issuecomment-1079579892
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';

import { browser } from '$app/env';
import { ethers, providers } from 'ethers';
import { get, writable } from 'svelte/store';
import type { Provider } from '@ethersproject/abstract-provider';

export type WalletData = {
  initialized: boolean;
  walletPresent?: boolean;
  connected: boolean;
  chainId?: number;
  accounts: string[];
  provider?: ethers.providers.Web3Provider;
};

interface InternalState {
  walletConnectProvider?: WalletConnectProvider;
}

function checkForWallet(): boolean {
  return typeof window.ethereum !== 'undefined';
}

export const walletStore = (() => {
  const walletStore = writable<WalletData>({
    initialized: false,
    connected: false,
    accounts: []
  });

  const internal = writable<InternalState>({});

  const { subscribe, update, set } = walletStore;

  if (browser) {
    initialize();
    if (checkForWallet()) registerListeners(window.ethereum as Provider);
  }

  async function initialize() {
    const wcProvider = new WalletConnectProvider({
      infuraId: 'aadcb5b20a6e4cc09edfdd664ed6334c',
      qrcode: false
    });

    // If WalletConnect is already connected, use it
    if (wcProvider.connected) {
      const web3Provider = new providers.Web3Provider(wcProvider);
      await web3Provider.ready;

      set({
        initialized: true,
        walletPresent: true,
        connected: true,
        accounts: wcProvider.accounts,
        provider: web3Provider,
        chainId: wcProvider.chainId
      });

      internal.set({
        walletConnectProvider: wcProvider
      });

      return;
    }

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

  function registerListeners(on: Provider) {
    get(walletStore).provider?.removeAllListeners();

    // Handle the user switching their network.
    on.on('chainChanged', () => {
      location.reload();
    });

    // Handle a new account being created or account being removed.
    on.on('accountsChanged', async (accounts: string[]) => {
      update((wd) => ({
        ...wd,
        accounts
      }));
    });
  }

  async function connectMetamask() {
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

  async function connectWalletConnect() {
    const provider = new WalletConnectProvider({
      infuraId: 'aadcb5b20a6e4cc09edfdd664ed6334c'
    });

    await provider.enable();

    const web3Provider = new providers.Web3Provider(provider);
    await web3Provider.ready;
    const accounts = await web3Provider.listAccounts();
    const chainId = web3Provider.network.chainId;

    console.log('foo');

    registerListeners(web3Provider);

    set({
      connected: true,
      initialized: true,
      walletPresent: true,
      provider: web3Provider,
      accounts,
      chainId
    });

    internal.set({
      walletConnectProvider: provider
    });
  }

  async function disconnect() {
    await get(internal).walletConnectProvider?.disconnect();

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
    connectMetamask,
    connectWalletConnect,
    disconnect
  };
})();
