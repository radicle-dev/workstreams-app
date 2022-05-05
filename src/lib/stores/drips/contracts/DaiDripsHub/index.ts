import type { ContractInfoFactory } from '../types';
import DaiDripsHubAbi from './abis/DaiDripsHub.json';

const addresses: { [chainId: number]: string } = {
  1: '0x8d321e80487356c846f34456d31ce761776ef697',
  4: '0x73043143e0a6418cc45d82d4505b096b802fd365'
};

const daiDripsHubInfo: ContractInfoFactory = (chainId: number) => ({
  address: addresses[chainId],
  abi: DaiDripsHubAbi
});

export default daiDripsHubInfo;
