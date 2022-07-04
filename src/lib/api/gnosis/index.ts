import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';

import { ethers, type ContractTransaction } from 'ethers';
import { getAddress } from 'ethers/lib/utils';

const GNOSIS_API_SAFES_BASE: { [chainId: number]: string } = {
  4: 'https://safe-transaction.rinkeby.gnosis.io',
  1: 'https://safe-transaction.gnosis.io'
};

export async function getSafesForAddress(chainId: number, address: string) {
  const ownedSafesReq = await fetch(
    `${GNOSIS_API_SAFES_BASE[chainId]}/api/v1/owners/${getAddress(
      address
    )}/safes/`
  );
  const ownedSafesRes = await ownedSafesReq.json();

  return ownedSafesRes?.safes || [];
}

export async function proposeTransaction(
  tx: ContractTransaction,
  safeAddress: string,
  provider: ethers.providers.Web3Provider,
  address: string
) {
  const ethAdapter = new EthersAdapter({
    ethers,
    signer: provider.getSigner()
  });

  const safeService = new SafeServiceClient({
    txServiceUrl: 'https://safe-transaction.gnosis.io',
    ethAdapter
  });

  const safeSdk = await Safe.create({ ethAdapter, safeAddress });

  const safeTransaction = await safeSdk.createTransaction({
    to: tx.to,
    value: tx.value.toString(),
    data: tx.data
  });

  await safeSdk.signTransaction(safeTransaction);

  await safeService.proposeTransaction({
    safeAddress,
    safeTransaction,
    safeTxHash: await safeSdk.getTransactionHash(safeTransaction),
    senderAddress: address
  });
}
