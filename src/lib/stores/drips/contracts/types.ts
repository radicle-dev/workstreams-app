import type { ContractInterface } from 'ethers';

export interface ContractInfo {
  abi: ContractInterface;
  address: string;
}

export type ContractInfoFactory = (chainId: number) => ContractInfo;
