import { Web3Provider } from '@ethersproject/providers';
import type { Network } from '@ethersproject/networks';
import detectEthereumProvider from '@metamask/detect-provider';
import type { MetaMaskInpageProvider } from '@metamask/providers';
// https://github.com/vitejs/vite/issues/7257#issuecomment-1079579892
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';

import { get, writable } from 'svelte/store';
import { browser } from '$app/env';
import { getConfig } from '$lib/config';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

// https://github.com/vitejs/vite/issues/7257#issuecomment-1102724531
if (browser) {
  (window.global as unknown) = globalThis;
}

export interface WalletState {
  metamaskInstalled: boolean;
  accounts: string[];
  walletType: 'metamask' | 'walletconnect';
  login?: Login;
  provider?: Web3Provider;
  network: Network;
  ready: boolean;
}

interface Login {
  expiresAt: Date;
  address: string;
}

async function getMetaMask(): Promise<MetaMaskInpageProvider | null> {
  return (await detectEthereumProvider({
    mustBeMetaMask: true,
    timeout: 500
  })) as MetaMaskInpageProvider | null;
}

const BACKEND_URL_BASE = getConfig().API_URL_BASE;

const DEFAULT_NETWORK: Network = {
  chainId: 1,
  name: 'homestead'
};

async function createSiweMessage(address: string, statement: string) {
  const res = await fetch(`${BACKEND_URL_BASE}/nonce`, {
    credentials: 'include'
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const message = new SiweMessage({
    domain: window.location.host,
    address: ethers.utils.getAddress(address),
    statement,
    uri: origin,
    expirationTime: nextWeek.toISOString(),
    version: '1',
    chainId: 1,
    nonce: await res.text()
  });
  return message;
}

async function sendSignatureForVerification(
  message: string,
  signature: string
) {
  const res = await fetch(`${BACKEND_URL_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ message, signature })
  });

  return res;
}

function prepareAccounts(accounts: string[]) {
  return accounts.map((a) => a.toLowerCase());
}

export const walletStore = (() => {
  const state = writable<WalletState>(undefined);

  async function initialize() {
    if (get(state) !== undefined) return;

    const detectedWindowProvider = await getMetaMask();
    const provider =
      detectedWindowProvider && new Web3Provider(window.ethereum);
    const accounts = await provider?.listAccounts();
    const network = await provider?.getNetwork();
    const login = accounts?.length > 0 && _restoreAuth(accounts);

    state.set({
      metamaskInstalled: Boolean(detectedWindowProvider),
      accounts: (accounts && prepareAccounts(accounts)) || [],
      walletType: detectedWindowProvider ? 'metamask' : undefined,
      login,
      provider,
      network: network || DEFAULT_NETWORK,
      ready: Boolean(login && detectedWindowProvider)
    });
  }

  async function connect(to: 'metamask' | 'walletconnect') {
    switch (to) {
      case 'metamask': {
        const metamask = await getMetaMask();

        if (!metamask) {
          throw 'MetaMask not detected.';
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

        const login = await _logIn(provider);

        state.update((s) => ({
          ...s,
          accounts,
          walletType: to,
          provider,
          login,
          chainId: provider.network.chainId,
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
          throw 'User did not grant access to any accounts';
        }

        try {
          const login = await _logIn(provider);

          state.update((s) => ({
            ...s,
            accounts: accounts,
            walletType: to,
            provider,
            login,
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
    await _logOut();
    _wipeStoredLogin();

    state.update((s) => ({
      ...s,
      accounts: [],
      walletType: undefined,
      login: undefined,
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

      if (accounts.length === 0) {
        disconnect();
      } else {
        const login = _restoreAuth(accounts);
        state.update((s) => ({
          ...s,
          accounts,
          login
        }));
      }
    });

    to.on('chainChanged', () => {
      location.reload();
    });
  }

  async function _logIn(provider: Web3Provider): Promise<Login> {
    const addressToLogIn = (await provider.listAccounts())[0];

    const message = await createSiweMessage(
      addressToLogIn,
      'Please sign this message to log in to Radicle Workstreams. Since this' +
        ' is not a transaction, there will be no transaction costs.'
    );

    const signature = await provider
      .getSigner()
      .signMessage(message.prepareMessage());

    const result = await sendSignatureForVerification(
      message.prepareMessage(),
      signature
    );

    if (result.status === 200) {
      const result = {
        expiresAt: new Date(message.expirationTime),
        address: addressToLogIn.toLowerCase()
      };

      localStorage.setItem('login', JSON.stringify(result));

      return result;
    } else {
      throw await result.text();
    }
  }

  async function _logOut() {
    await fetch(`${BACKEND_URL_BASE}/logout`, {
      credentials: 'include'
    });
  }

  function _restoreAuth(accounts: string[]): Login | null {
    const login = _checkLoggedInAs(accounts[0]);
    if (!login) {
      _wipeStoredLogin();
      return null;
    }

    return login;
  }

  function _checkLoggedInAs(account: string): Login | null {
    const storedData = localStorage.getItem('login');
    const savedState: Login | null =
      storedData &&
      JSON.parse(storedData, (key, value) =>
        key === 'expiresAt' ? new Date(value) : value
      );

    const loggedInWithRightAddress =
      savedState?.address === account.toLowerCase();
    const loginValid =
      savedState && savedState.expiresAt.getTime() > new Date().getTime();

    return loggedInWithRightAddress && loginValid ? savedState : null;
  }

  function _wipeStoredLogin() {
    localStorage.removeItem('login');
  }

  return {
    subscribe: state.subscribe,
    initialize,
    connect,
    disconnect
  };
})();
