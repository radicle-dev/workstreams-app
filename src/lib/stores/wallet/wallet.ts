import { browser } from '$app/env';
import { ethers, Signer } from 'ethers';
import { get, writable } from 'svelte/store';
import { authStore } from '../auth/auth';

export type WalletData =
  | {
      connected: true;
      connecting: false;
      signer: Signer;
      chainId: number;
      provider: ethers.providers.Web3Provider;
      address: string;
    }
  | {
      connected: false;
      connecting: boolean;
    };

function updateAccounts(
  walletData: WalletData,
  accounts: string[],
  chainId: number
): WalletData {
  if (![1, 4].includes(chainId))
    throw new Error('We currently only support Rinkeby and Mainnet.');

  if (accounts[0]) {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum,
      chainId
    );

    return {
      connected: true,
      connecting: (walletData.connected && walletData.connecting) || false,
      address: accounts[0].toLowerCase(),
      provider,
      chainId,
      signer: provider.getSigner()
    };
  } else {
    return {
      connected: false,
      connecting: false
    };
  }
}

export const walletStore = (() => {
  const { subscribe, update, set } = writable<WalletData>({
    connected: false,
    connecting: false
  });

  if (browser) {
    window.ethereum.on('chainChanged', (chainId: string) => {
      update((walletData) => {
        if (!walletData.connected)
          throw new Error(
            'Expected to be connected to wallet when receiving chainChanged'
          );

        return updateAccounts(
          walletData,
          [walletData.address],
          parseInt(chainId, 16)
        );
      });

      location.reload();
    });

    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
      const chainId: string = await window.ethereum.request({
        method: 'eth_chainId'
      });
      update((walletData) =>
        updateAccounts(walletData, accounts, parseInt(chainId))
      );
    });

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(async (accounts) => {
        const chainId: string = await window.ethereum.request({
          method: 'eth_chainId'
        });
        update((walletData) =>
          updateAccounts(walletData, accounts, parseInt(chainId))
        );
      });
  }

  async function connect(): Promise<WalletData> {
    const walletData = get(walletStore);

    const provider = walletData.connected
      ? walletData.provider
      : new ethers.providers.Web3Provider(window.ethereum, 'rinkeby');

    set({
      connected: false,
      connecting: true
    });

    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [
        {
          eth_accounts: {}
        }
      ]
    });
    const accounts = await provider.send('eth_requestAccounts', []);
    const chainId: string = await window.ethereum.request({
      method: 'eth_chainId'
    });

    set({
      connected: true,
      connecting: false,
      address: accounts[0].toLowerCase(),
      provider,
      chainId: parseInt(chainId, 16),
      signer: provider.getSigner()
    });

    return get(walletStore);
  }

  function disconnect() {
    set({
      connected: false,
      connecting: false
    });
    authStore.clear();
  }

  return {
    subscribe,
    connect,
    disconnect
  };
})();
