import { toWei } from 'web3-utils';

export const eth = (amount: number) => BigInt(toWei(String(amount), 'ether'));
