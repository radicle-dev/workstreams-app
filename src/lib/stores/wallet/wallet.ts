import { browser } from '$app/env';
import { ethers, Signer } from 'ethers';
import { get, writable } from 'svelte/store';

export type WalletData =
	| {
			connected: true;
			connecting: false;
			signer: Signer;
			provider: ethers.providers.Web3Provider;
			address: string;
	  }
	| {
			connected: false;
			connecting: boolean;
	  };

function updateAccounts(walletData: WalletData, accounts: string[]): WalletData {
	if (accounts[0]) {
		const provider = new ethers.providers.Web3Provider(window.ethereum, 'rinkeby');

		return {
			connected: true,
			connecting: (walletData.connected && walletData.connecting) || false,
			address: accounts[0],
			provider,
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
		window.ethereum.on('accountsChanged', (accounts) => {
			update((walletData) => updateAccounts(walletData, accounts));
		});

		window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
			update((walletData) => updateAccounts(walletData, accounts));
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

		set({
			connected: true,
			connecting: false,
			address: accounts[0],
			provider,
			signer: provider.getSigner()
		});

		return get(walletStore);
	}

	function disconnect() {
		set({
			connected: false,
			connecting: false
		});
	}

	return {
		subscribe,
		connect,
		disconnect
	};
})();
