import type { providers } from 'ethers';
import { get } from 'svelte/store';

import drips from '../drips';
import { walletStore } from '../wallet/wallet';
import { workstreamsStore } from '../workstreams';

export default async function (provider: providers.Web3Provider) {
  await drips.connect(provider);

  const ws = get(walletStore);

  await workstreamsStore.connect(
    ws.address,
    ws.network.chainId,
    get(drips).cycle
  );
}
