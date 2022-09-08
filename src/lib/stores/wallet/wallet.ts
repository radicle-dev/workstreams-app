import { Web3Provider } from '@ethersproject/providers';
import type { Network } from '@ethersproject/networks';
import detectEthereumProvider from '@metamask/detect-provider';
import type { MetaMaskInpageProvider } from '@metamask/providers';
// https://github.com/vitejs/vite/issues/7257#issuecomment-1079579892
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';

import { get, writable } from 'svelte/store';
import { browser } from '$app/env';

// https://github.com/vitejs/vite/issues/7257#issuecomment-1102724531
if (browser) {
  (window.global as unknown) = globalThis;
}

export interface WalletState {
  metamaskInstalled?: boolean;
  /** Array of locally connected accounts */
  accounts?: string[];
  walletType?: 'metamask' | 'walletconnect';
  /**
   * Canonical address of the current user.
   * Either the first of any locally connected accounts,
   * or the address of a Gnosis Safe that has been linked
   * to the current session via `linkSafe`.
   */
  address?: string;
  provider?: Web3Provider;
  network?: Network;
  ready: boolean;
}

async function getMetaMask(): Promise<MetaMaskInpageProvider | null> {
  return (await detectEthereumProvider({
    mustBeMetaMask: true,
    timeout: 500
  })) as MetaMaskInpageProvider | null;
}

const DEFAULT_NETWORK: Network = {
  chainId: 1,
  name: 'homestead'
};

function prepareAccounts(accounts: string[]) {
  return accounts.map((a) => a.toLowerCase());
}

export const walletStore = (() => {
  const state = writable<WalletState>(undefined);

  async function initialize() {
    if (get(state) !== undefined) return;

    const detectedWindowProvider = await getMetaMask();
    const provider =
      (detectedWindowProvider && new Web3Provider(window.ethereum)) ??
      undefined;
    const accounts = await provider?.listAccounts();
    const network = await provider?.getNetwork();

    if (detectedWindowProvider) _attachListeners(detectedWindowProvider);

    state.set({
      metamaskInstalled: Boolean(detectedWindowProvider),
      accounts: (accounts && prepareAccounts(accounts)) ?? [],
      address: accounts?.[0]?.toLowerCase(),
      walletType: detectedWindowProvider ? 'metamask' : undefined,
      provider,
      network: network ?? DEFAULT_NETWORK,
      ready: Boolean(accounts?.[0])
    });
  }

  async function connect(to: 'metamask' | 'walletconnect') {
    switch (to) {
      case 'metamask': {
        const metamask = await getMetaMask();

        if (!metamask) {
          throw new Error('MetaMask not detected.');
        }

        await metamask.request({
          method: 'wallet_requestPermissions',
          params: [
            {
              eth_accounts: {}
            }
          ]
        });

        const provider = new Web3Provider(window.ethereum);
        await provider.ready;

        const accounts = prepareAccounts(await provider.listAccounts());

        if (!accounts || accounts.length === 0) {
          throw { message: 'User did not grant access to any accounts' };
        }

        const network = await provider.getNetwork();

        state.update((s) => ({
          ...s,
          accounts,
          address: accounts[0],
          walletType: to,
          provider,
          network,
          ready: true
        }));

        _attachListeners(metamask);

        break;
      }
      case 'walletconnect': {
        const walletConnectProvider = new WalletConnectProvider({
          infuraId: 'aadcb5b20a6e4cc09edfdd664ed6334c'
        });

        await walletConnectProvider.disconnect();
        await walletConnectProvider.enable();

        const provider = new Web3Provider(walletConnectProvider);
        await provider.ready;

        const accounts = await provider.listAccounts();

        if (accounts.length === 0) {
          throw new Error('User did not grant access to any accounts');
        }

        try {
          state.update((s) => ({
            ...s,
            accounts: prepareAccounts(accounts),
            address: accounts[0],
            walletType: to,
            provider,
            network: provider.network,
            ready: true
          }));

          _attachListeners(walletConnectProvider);
        } catch (e) {
          await walletConnectProvider.disconnect();
          throw e;
        }

        break;
      }
    }
  }

  async function disconnect() {
    state.update((s) => ({
      ...s,
      safe: undefined,
      address: undefined,
      accounts: [],
      walletType: undefined,
      provider: undefined,
      network: DEFAULT_NETWORK,
      ready: false
    }));
  }

  function _attachListeners(
    to: WalletConnectProvider | MetaMaskInpageProvider
  ) {
    to.on('accountsChanged', (newAccounts: string[]) => {
      const accounts = prepareAccounts(newAccounts);

      state.update((s) => ({
        ...s,
        accounts,
        address: accounts[0]
      }));
    });

    to.on('chainChanged', () => {
      location.reload();
    });
  }

  return {
    subscribe: state.subscribe,
    initialize,
    connect,
    disconnect
  };
})();
