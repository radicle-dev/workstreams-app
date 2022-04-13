import { browser } from '$app/env';
import { ethers, Signer } from 'ethers';
import { SiweMessage } from 'siwe';
import { writable } from 'svelte/store';

type WalletData = {
  initialized: true;
  connecting: false;
  authenticated: boolean;
  signer: Signer;
  provider: ethers.providers.Web3Provider;
  address: string;
} | {
  initialized: false;
  connecting: boolean;
  authenticated?: boolean;
}

const BACKEND_URL_BASE = 'http://127.0.0.1:5001/radicle-workstreams/us-central1/api';

async function createSiweMessage(address: string, statement: string) {
  const res = await fetch(`${BACKEND_URL_BASE}/nonce`, { credentials: 'include' });

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
  return message.prepareMessage();
}

async function sendSignatureForVerification(message: string, signature: string) {
  const res = await fetch(`${BACKEND_URL_BASE}/login`, {
      method: "POST",
      headers: {
          'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify({ message, signature }),
  });
  
  return res;
}


function getCookieValue(name) {
  return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';
}

function updateAccounts(walletData: WalletData, accounts: string[]): WalletData {
  if (accounts[0]) {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "rinkeby");

    return {
      initialized: true,
      authenticated: getCookieValue("auth") === "true",
      connecting: walletData.initialized && walletData.connecting || false,
      address: accounts[0],
      provider,
      signer: provider.getSigner(),
    };
  } else {
    return {
      initialized: false,
      connecting: false,
    }
  }
}

export const walletStore = (() => {
	const { subscribe, update, set } = writable<WalletData>({
    initialized: false,
    connecting: false,
  });

  if (browser) {
    window.ethereum.on("accountsChanged", (accounts) => {
      update((walletData) => updateAccounts(walletData, accounts));
    });

    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      update((walletData) => updateAccounts(walletData, accounts));
    });
  }

  function connect(current: WalletData): WalletData {
    const provider = current.initialized
      ? current.provider
      : new ethers.providers.Web3Provider(window.ethereum, "rinkeby"); 

    set({
      initialized: false,
      connecting: true,
    });

    provider.send('eth_requestAccounts', [])
      .then((result) => set({
        initialized: true,
        authenticated: false,
        connecting: false,
        address: result[0],
        provider,
        signer: provider.getSigner(),
      }))
      .catch(() => console.log("Error while connecting to wallet"));

    return current;
  }

  function disconnect() {
    set({
      initialized: false,
      connecting: false,
    });
  }

  function authenticate(walletData: WalletData): WalletData {
    if (!walletData.initialized) throw new Error("Initialize Wallet first");

    console.log(walletData.address);

    (async () => {
      const message = await createSiweMessage(
        walletData.address,
        "Please sign this message to log in to Radicle Workstreams. Since this"
        + " is not a transaction, there will be no transaction costs."
      );
  
      const signature = await walletData.signer.signMessage(message);

      const result = await sendSignatureForVerification(message, signature);

      if (result.status === 200) {
        update((walletData) => ({
          ...walletData,
          authenticated: true,
        }));
      }
    })();

    return walletData;
  }

  return {
    subscribe,
    connect: () => update((walletData) => connect(walletData)),
    disconnect,
    authenticate: () => update((walletData) => authenticate(walletData)),
  }
})();
