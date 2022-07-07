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
