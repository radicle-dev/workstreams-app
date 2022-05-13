import query from '$lib/api';
import { GET_LAST_DRIP_ENTRY } from '$lib/api/queries';
import type { DripsConfigs_dripsConfigs_receivers } from '$lib/api/__generated__/DripsConfigs';
import type {
  lastDripsEntry,
  lastDripsEntryVariables
} from '$lib/api/__generated__/lastDripsEntry';
import { BigNumber, ethers, type ContractTransaction } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { get, writable } from 'svelte/store';
import { walletStore } from '../wallet/wallet';
import type { Money } from '../workstreams/types';
import daiInfo from './contracts/Dai';
import daiDripsHubInfo from './contracts/DaiDripsHub';
import {
  DaiAbi__factory,
  DaiDripsHubAbi__factory
} from './contracts/types/index';

/*
  Lifted from drips-app
  https://discord.com/channels/841318878125490186/875668327614255164/918094059732623411
  - Look at the latest user's DripsUpdated, it has a timestamp, uint128 balance and DripsReceiver[] receivers
  - Add up all the receiers' amtPerSec, it's totalAmtPerSec
  - withdrawable = eventBalance - (currTimestamp - eventTimestamp) * totalAmtPerSec
  - if withdrawable < 0, withdrawable = eventBalance % totalAmtPerSec
*/
function getDripsWithdrawable(
  receivers: DripsConfigs_dripsConfigs_receivers[],
  balance: string,
  timestamp: number
) {
  const currTimestamp = Math.floor(new Date().getTime() / 1000); // sec
  const totalAmtPerSec = receivers.reduce(
    (acc, curr) => acc.add(curr.amtPerSec),
    BigNumber.from(0)
  );
  const eventBalance = BigNumber.from(balance);
  let withdrawable = eventBalance.sub(
    totalAmtPerSec.mul(currTimestamp - timestamp)
  );
  if (withdrawable.lt(0)) {
    withdrawable = eventBalance.mod(totalAmtPerSec);
  }

  return withdrawable;
}

export const round = (num: number, dec = 2) =>
  (Math.floor(num * 100) / 100).toFixed(dec);

export const toDai = (wei: BigNumber, roundTo?: number): string => {
  const dai = parseInt(formatEther(wei));

  if (dai > 0 && dai < 0.01) {
    return '<0.01';
  }

  return round(dai, roundTo);
};

export default (() => {
  const { subscribe } = writable();

  // TODO: Caching

  async function getAllowance(): Promise<BigNumber> {
    const ws = get(walletStore);
    const daiDripsHubAddress = daiDripsHubInfo(ws.chainId).address;

    const daiContract = DaiAbi__factory.connect(
      daiInfo(ws.chainId).address,
      ws.provider.getSigner()
    );

    const rs = await daiContract.allowance(ws.accounts[0], daiDripsHubAddress);

    return rs;
  }

  async function approveDaiSpend(): Promise<ContractTransaction> {
    const ws = get(walletStore);

    if (!ws.connected) throw new Error('Connect your wallet first.');
    if (!ws.provider) throw new Error('No Provider available.');

    const daiContract = DaiAbi__factory.connect(
      daiInfo(ws.chainId).address,
      ws.provider.getSigner()
    );

    const amount = ethers.constants.MaxUint256;

    return daiContract.approve(daiDripsHubInfo(ws.chainId).address, amount);
  }

  async function getDaiBalance(): Promise<BigNumber> {
    const ws = get(walletStore);

    const daiContract = DaiAbi__factory.connect(
      daiInfo(ws.chainId).address,
      ws.provider.getSigner()
    );

    return daiContract.balanceOf(ws.accounts[0]);
  }

  async function getCollectable(): Promise<string> {
    const ws = get(walletStore);

    if (!ws.connected) throw new Error('Connect your wallet first.');
    if (!ws.provider) throw new Error('No Provider available.');

    const daiDripsHubAddress = daiDripsHubInfo(ws.chainId).address;
    const contract = DaiDripsHubAbi__factory.connect(
      daiDripsHubAddress,
      ws.provider.getSigner()
    );

    const rs = await contract.collectable(ws.accounts[0], []);
    return toDai(rs[0].add(rs[1]));
  }

  async function createDrip(
    receiver: string,
    ratePerSecond: Money,
    topUpDaiWei: bigint
  ) {
    const ws = get(walletStore);

    if (!ws.connected) throw new Error('Connect your wallet first.');
    if (!ws.provider) throw new Error('No Provider available.');

    const daiDripsHubAddress = daiDripsHubInfo(ws.chainId).address;
    const contract = DaiDripsHubAbi__factory.connect(
      daiDripsHubAddress,
      ws.provider.getSigner()
    );

    const lastDripsEntry = (
      await query<lastDripsEntry, lastDripsEntryVariables>({
        query: GET_LAST_DRIP_ENTRY,
        variables: {
          user: ws.accounts[0]
        },
        chainId: ws.chainId
      })
    ).dripsEntries[0];

    const callConfig = {
      balance: 0,
      timestamp: 0,
      currentReceivers: []
    };

    const accountId = lastDripsEntry ? parseInt(lastDripsEntry.account) + 1 : 0;

    const tx = await contract[
      'setDrips(uint256,uint64,uint128,(address,uint128)[],int128,(address,uint128)[])'
    ](
      accountId,
      callConfig.timestamp,
      callConfig.balance,
      callConfig.currentReceivers,
      topUpDaiWei,
      [{ receiver, amtPerSec: ratePerSecond.wei }]
    );

    return {
      tx,
      accountId
    };
  }

  return {
    subscribe,
    createDrip,
    getAllowance,
    getDaiBalance,
    approveDaiSpend,
    getCollectable
  };
})();
