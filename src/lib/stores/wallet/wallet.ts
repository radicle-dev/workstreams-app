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

interface SafeConnection {
  address: string;
  ready: boolean;
  provider?: Web3Provider;
  network?: Network;
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
  /**
   * Information about a Gnosis Safe that has been linked
   * and / or connected via WalletConnect in addition to
   * the locally connected account.
   */
  safe?: SafeConnection;
  login?: Login;
  provider?: Web3Provider;
  network?: Network;
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
      (detectedWindowProvider && new Web3Provider(window.ethereum)) ||
      undefined;
    const accounts = await provider?.listAccounts();
    const network = await provider?.getNetwork();
    const login =
      (accounts && accounts?.length > 0 && _restoreAuth(accounts)) || undefined;

    if (detectedWindowProvider) _attachListeners(detectedWindowProvider);

    state.set({
      metamaskInstalled: Boolean(detectedWindowProvider),
      accounts: (accounts && prepareAccounts(accounts)) || [],
      address: (login && accounts?.[0]?.toLowerCase()) || undefined,
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

        const login = await _logIn(
          provider,
          'Please sign this message to log in to Radicle Workstreams. Since this' +
            ' is not a transaction, there will be no transaction costs.'
        );

        const network = await provider.getNetwork();

        state.update((s) => ({
          ...s,
          accounts,
          address: accounts[0],
          walletType: to,
          provider,
          login,
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
          const login = await _logIn(
            provider,
            'Please sign this message to log in to Radicle Workstreams. Since this' +
              ' is not a transaction, there will be no transaction costs.'
          );

          state.update((s) => ({
            ...s,
            accounts: prepareAccounts(accounts),
            address: accounts[0],
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

  async function linkSafe(safeAddress: string) {
    const currentState = get(state);

    if (!currentState.ready) {
      throw new Error('Connect to wallet first.');
    }

    const res = await fetch(`${BACKEND_URL_BASE}/connect-safe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ safeAddress })
    });

    if (res.ok) {
      /*
        If a safe has been connected, we don't want to restore the current
        session from localStorage in order to avoid

        1. People still being logged in to a safe that they got kicked from.
        2. An incomplete session being restored, which is associated with
           safe server-side, but not connected to the safe on the client.
      */
      _wipeStoredLogin();

      state.update((s) => ({
        ...s,
        safe: {
          address: safeAddress.toLowerCase(),
          ready: false
        }
      }));
    } else {
      throw await res.text();
    }
  }

  async function connectSafe() {
    const currentState = get(state);

    if (!currentState.safe?.address) {
      throw new Error('Link a safe first via `linkSafe`.');
    }

    if (currentState.safe.ready) {
      throw new Error('A safe is already connected.');
    }

    const walletConnectProvider = new WalletConnectProvider({
      infuraId: 'aadcb5b20a6e4cc09edfdd664ed6334c'
    });

    await walletConnectProvider.disconnect();
    await walletConnectProvider.enable();

    const provider = new Web3Provider(walletConnectProvider);
    await provider.ready;

    const account = (await provider.listAccounts())[0];

    if (currentState.safe.address.toLowerCase() !== account.toLowerCase()) {
      throw new Error('You can only connect the safe that you selected.');
    }

    const network = await provider.getNetwork();

    state.update((s) => {
      if (!s.safe) throw new Error('Safe must be connected via `linkSafe`');

      return {
        ...s,
        address: s.safe?.address,
        safe: {
          ...s.safe,
          ready: true,
          provider,
          network
        }
      };
    });
  }

  async function disconnect() {
    await _logOut();
    _wipeStoredLogin();

    state.update((s) => ({
      ...s,
      safe: undefined,
      address: undefined,
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
          address: accounts[0],
          login
        }));
      }
    });

    to.on('chainChanged', () => {
      location.reload();
    });
  }

  async function _logIn(
    provider: Web3Provider,
    signMessage: string
  ): Promise<Login> {
    const addressToLogIn = (await provider.listAccounts())[0];

    const message = await createSiweMessage(addressToLogIn, signMessage);

    if (!message.expirationTime)
      throw new Error('Ensure an expiration time is set in SIWE message');

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

      _updateStoredLogin(result);

      return result;
    } else {
      throw await result.text();
    }
  }

  function _updateStoredLogin(login: Login) {
    localStorage.setItem('login', JSON.stringify(login));
  }

  function _getStoredLogin(): Login | undefined {
    const stored = localStorage.getItem('login');

    return stored
      ? JSON.parse(stored, (key, value) =>
          key === 'expiresAt' ? new Date(value) : value
        )
      : undefined;
  }

  function _wipeStoredLogin() {
    localStorage.removeItem('login');
  }

  async function _logOut() {
    await fetch(`${BACKEND_URL_BASE}/logout`, {
      credentials: 'include'
    });
  }

  function _restoreAuth(accounts: string[]): Login | undefined {
    const login = _checkLoggedInAs(accounts[0]);
    if (!login) {
      _wipeStoredLogin();
      return undefined;
    }

    return login;
  }

  function _checkLoggedInAs(account: string): Login | null {
    const storedData = _getStoredLogin();

    const loggedInWithRightAddress =
      storedData?.address === account.toLowerCase();
    const loginValid =
      storedData && storedData.expiresAt.getTime() > new Date().getTime();

    return loggedInWithRightAddress && loginValid ? storedData : null;
  }

  return {
    subscribe: state.subscribe,
    linkSafe,
    connectSafe,
    initialize,
    connect,
    disconnect
  };
})();
