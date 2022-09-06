import type { providers } from 'ethers';
import { get } from 'svelte/store';

import drips from '../drips';
import { walletStore } from '../wallet/wallet';
import { workstreamsStore } from '../workstreams';

export default async function (provider: providers.Web3Provider) {
  await drips.connect(provider);
  const { cycle } = get(drips);
  if (!cycle) throw new Error('Unable to fetch drips cycle information');

  const { address, network } = get(walletStore);
  if (!address || !network) throw new Error('Connect a wallet first');

  await workstreamsStore.connect(address, network.chainId, cycle);
}
