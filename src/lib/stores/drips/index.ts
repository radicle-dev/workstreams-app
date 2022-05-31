import query from '$lib/api';
import { GET_LAST_DRIP_ENTRY } from '$lib/api/queries';
import type {
  LastDripsEntry,
  LastDripsEntryVariables
} from '$lib/api/__generated__/lastDripsEntry';
import type { BigNumber, ethers, ContractTransaction } from 'ethers';
import { utils } from 'ethers';
import { get, writable } from 'svelte/store';
import { walletStore } from '../wallet/wallet';
import { Currency, type Money } from '../workstreams/types';
import daiInfo from './contracts/Dai';
import daiDripsHubInfo from './contracts/DaiDripsHub';
import {
  DaiAbi__factory,
  DaiDripsHubAbi__factory
} from './contracts/types/index';

import { DripsClient } from 'drips-sdk';

interface InternalState {
  provider: ethers.providers.Web3Provider;
  client: DripsClient;
}

export interface Cycle {
  start: Date;
  end: Date;
}

interface DripsState {
  cycle?: Cycle;
  collectable?: Money;
}

export const round = (num: number, dec = 2) =>
  (Math.floor(num * 100) / 100).toFixed(dec);

export const toDai = (wei: BigNumber, roundTo?: number): string => {
  const dai = parseInt(utils.formatEther(wei));

  if (dai > 0 && dai < 0.01) {
    return '<0.01';
  }

  return round(dai, roundTo);
};

export default (() => {
  const internal = writable<InternalState | undefined>(undefined);
  const state = writable<DripsState>({});

  async function connect(provider: ethers.providers.Web3Provider) {
    const client = new DripsClient(provider);
    await client.connect();

    internal.set({
      provider,
      client
    });

    await Promise.all([updateCycleSecs(), updateCollectable()]);
  }

  function disconnect() {
    internal.set(undefined);
    state.set({});
  }

  async function updateCycleSecs(): Promise<void> {
    const { provider } = get(internal);

    const dripsHub = DaiDripsHubAbi__factory.connect(
      daiDripsHubInfo(provider.network.chainId).address,
      provider.getSigner()
    );

    const cycleSecs = (await dripsHub.cycleSecs()).toBigInt();
    const currentCycleSecs = BigInt(Math.floor(Date.now() / 1000)) % cycleSecs;
    const currentCycleStart = new Date(
      new Date().getTime() - Number(currentCycleSecs) * 1000
    );
    const nextCycleStart = new Date(
      currentCycleStart.getTime() + Number(cycleSecs * BigInt(1000))
    );

    state.update((v) => ({
      ...v,
      cycle: {
        start: currentCycleStart,
        end: nextCycleStart
      }
    }));
  }

  async function updateCollectable(): Promise<void> {
    const { client, provider } = get(internal);

    const collectable = await client.getAmountCollectableWithSplits(
      await provider.getSigner().getAddress(),
      []
    );

    state.update((v) => ({
      ...v,
      collectable: {
        currency: Currency.DAI,
        wei: collectable[0].add(collectable[1]).toBigInt()
      }
    }));
  }

  async function getDripsUpdatedEvents(user?: string, account?: number) {
    const { provider } = get(internal);

    const dripsHub = DaiDripsHubAbi__factory.connect(
      daiDripsHubInfo(provider.network.chainId).address,
      provider.getSigner()
    );

    const filter = dripsHub.filters[
      'DripsUpdated(address,uint256,uint128,(address,uint128)[])'
    ](user, account);

    return dripsHub.queryFilter(filter);
  }

  async function getAllowance(): Promise<BigNumber> {
    const { client } = get(internal);
    return client.getAllowance();
  }

  async function approveDaiSpend(): Promise<ContractTransaction> {
    const { client } = get(internal);

    return client.approveDAIContract();
  }

  async function getDaiBalance(): Promise<BigNumber> {
    const { provider } = get(internal);

    const daiContract = DaiAbi__factory.connect(
      daiInfo(provider.network.chainId).address,
      provider.getSigner()
    );

    return daiContract.balanceOf(await provider.getSigner().getAddress());
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
      await query<LastDripsEntry, LastDripsEntryVariables>({
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
    subscribe: state.subscribe,
    connect,
    disconnect,
    createDrip,
    getDripsUpdatedEvents,
    getAllowance,
    getDaiBalance,
    approveDaiSpend
  };
})();
