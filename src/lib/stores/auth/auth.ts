import { browser } from "$app/env";
import { getConfig } from "$lib/config";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import { get, writable } from "svelte/store";
import type { WalletData } from "../wallet/wallet";

interface AuthData {
  expiresAt?: string;
  authenticated: boolean;
  address?: string;
}

const BACKEND_URL_BASE = getConfig().API_URL_BASE;

async function createSiweMessage(address: string, statement: string) {
  const res = await fetch(`${BACKEND_URL_BASE}/nonce`, { credentials: "include" });

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

export const authStore = (() => {
  const { update, set, subscribe } = writable<AuthData>({
    expiresAt: null,
    authenticated: false,
  });

  if (browser) {
    const localState = JSON.parse(localStorage.getItem("auth"));
    if (localState) set(localState);
    subscribe((authData) => localStorage.setItem("auth", JSON.stringify(authData)));
  }

  subscribe((authData) => {
    if (authData.expiresAt && new Date(authData.expiresAt) < new Date()) {
      set({
        expiresAt: null,
        authenticated: false,
      });
    }
  });

  async function authenticate(walletData: WalletData): Promise<AuthData> {
    if (!walletData.connected) throw new Error("Initialize Wallet first");

    const message = await createSiweMessage(
      walletData.address,
      "Please sign this message to log in to Radicle Workstreams. Since this"
      + " is not a transaction, there will be no transaction costs."
    );

    const signature = await walletData
        .signer
        .signMessage(message.prepareMessage());

    const result = await sendSignatureForVerification(
      message.prepareMessage(),
      signature,
    );

    if (result.status === 200) {
      set({
        expiresAt: message.expirationTime,
        authenticated: true,
        address: walletData.address,
      });
    }

    return get(authStore);
  }

  return {
    update,
    set,
    subscribe,
    authenticate,
  }
})();
