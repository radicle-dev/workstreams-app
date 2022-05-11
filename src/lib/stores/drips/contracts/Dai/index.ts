import type { ContractInfoFactory } from '../types';
import daiAbi from './dai.abi.json';

const addresses: { [chainId: number]: string } = {
  1: '0x6b175474e89094c44da98b954eedeac495271d0f',
  4: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'
};

const daiInfo: ContractInfoFactory = (chainId: number) => ({
  address: addresses[chainId],
  abi: daiAbi
});

export default daiInfo;
