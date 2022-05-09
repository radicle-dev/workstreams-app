import type { ContractInfoFactory } from '../types';
import DaiDripsHubAbi from './abi.json';

const addresses: { [chainId: number]: string } = {
  1: '0x73043143e0a6418cc45d82d4505b096b802fd365',
  4: '0xfbcD6918907902c106A99058146CBdBb76a812f6'
};

const daiDripsHubInfo: ContractInfoFactory = (chainId: number) => ({
  address: addresses[chainId],
  abi: DaiDripsHubAbi
});

export default daiDripsHubInfo;
