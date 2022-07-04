import { BigNumber, type ethers, type ContractTransaction } from 'ethers';
import { utils } from 'ethers';
import type { Block } from '@ethersproject/abstract-provider';
import { randomHex } from 'web3-utils';
import { get, writable } from 'svelte/store';

import { Currency, type Money } from '../workstreams/types';
import daiInfo from './contracts/Dai';
import daiDripsHubInfo from './contracts/DaiDripsHub';
import {
  DaiAbi__factory,
  DaiDripsHubAbi__factory
} from './contracts/types/index';

import { DripsClient, type CollectedEvent } from 'drips-sdk';
import type { EnrichedWorkstream } from '../workstreams';

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
  collectHistory?: CollectedEventWrapper[];
}

interface CollectedEventWrapper {
  event: CollectedEvent;
  fromBlock: Block;
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

// https://github.com/radicle-dev/drips-js-sdk/issues/34
const networkNameMap = {
  1: 'mainnet',
  4: 'rinkeby'
};

export default (() => {
  const internal = writable<InternalState | undefined>(undefined);
  const state = writable<DripsState>({});

  async function connect(provider: ethers.providers.Web3Provider) {
    const client = new DripsClient(
      provider,
      networkNameMap[provider.network.chainId]
    );
    await client.connect();

    internal.set({
      provider,
      client
    });

    await Promise.all([
      updateCycleSecs(),
      updateCollectable(),
      updateCollectHistory()
    ]);
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

  async function updateCollectHistory(): Promise<void> {
    const { provider } = get(internal);

    const dripsHub = DaiDripsHubAbi__factory.connect(
      daiDripsHubInfo(provider.network.chainId).address,
      provider.getSigner()
    );

    const filter = dripsHub.filters['Collected(address,uint128,uint128)'](
      await provider.getSigner().getAddress()
    );
    const events = await dripsHub.queryFilter(filter);
    const wrappedEventPromises = events.map(async (e) => ({
      event: e,
      fromBlock: await e.getBlock()
    }));
    const wrappedEvents = await Promise.all(wrappedEventPromises);

    state.update((v) => ({
      ...v,
      collectHistory: wrappedEvents
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

  async function getDripsUpdatedEvents(user?: string, account?: bigint) {
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

  function getRandomAccountId() {
    return BigNumber.from(randomHex(32)).toBigInt();
  }

  async function createDrip(
    receiver: string,
    ratePerSecond: Money,
    accountId: bigint,
    topUpDaiWei: bigint
  ) {
    const { provider } = get(internal);

    const daiDripsHubAddress = daiDripsHubInfo(
      provider.network.chainId
    ).address;
    const contract = DaiDripsHubAbi__factory.connect(
      daiDripsHubAddress,
      provider.getSigner()
    );

    const callConfig = {
      balance: 0,
      timestamp: 0,
      currentReceivers: []
    };

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

  async function topUp(workstream: EnrichedWorkstream, topUpDaiWei: bigint) {
    const { provider } = get(internal);

    if (!workstream.data.dripsData) throw 'No drips data for workstream';
    if (workstream.onChainData?.dripsUpdatedEvents?.length === 0)
      throw 'No DripsUpdated events for workstream';

    const daiDripsHubAddress = daiDripsHubInfo(
      provider.network.chainId
    ).address;
    const contract = DaiDripsHubAbi__factory.connect(
      daiDripsHubAddress,
      provider.getSigner()
    );

    const { dripsUpdatedEvents } = workstream.onChainData;
    const lastUpdate = dripsUpdatedEvents[dripsUpdatedEvents.length - 1];

    return contract[
      'setDrips(uint256,uint64,uint128,(address,uint128)[],int128,(address,uint128)[])'
    ](
      workstream.data.dripsData.accountId,
      lastUpdate.fromBlock.timestamp,
      lastUpdate.event.args.balance,
      lastUpdate.event.args.receivers,
      topUpDaiWei,
      lastUpdate.event.args.receivers
    );
  }

  async function pauseUnpause(
    action: 'pause' | 'unpause',
    workstream: EnrichedWorkstream
  ) {
    const { provider } = get(internal);

    if (!workstream.data.dripsData) throw 'No drips data for workstream';
    if (workstream.onChainData?.dripsUpdatedEvents?.length === 0)
      throw 'No DripsUpdated events for workstream';

    const daiDripsHubAddress = daiDripsHubInfo(
      provider.network.chainId
    ).address;
    const contract = DaiDripsHubAbi__factory.connect(
      daiDripsHubAddress,
      provider.getSigner()
    );

    const { dripsUpdatedEvents } = workstream.onChainData;
    const lastUpdate = dripsUpdatedEvents[dripsUpdatedEvents.length - 1];
    const lastReceivers = dripsUpdatedEvents
      .slice()
      .reverse()
      .find((dew) =>
        dew.event.args.receivers.find(
          (r) =>
            r.receiver.toLowerCase() === workstream.data.acceptedApplication
        )
      )?.event.args.receivers;

    return contract[
      'setDrips(uint256,uint64,uint128,(address,uint128)[],int128,(address,uint128)[])'
    ](
      workstream.data.dripsData.accountId,
      lastUpdate.fromBlock.timestamp,
      lastUpdate.event.args.balance,
      lastUpdate.event.args.receivers,
      0,
      action === 'pause' ? [] : lastReceivers
    );
  }

  async function collect() {
    const { provider } = get(internal);

    const daiDripsHubAddress = daiDripsHubInfo(
      provider.network.chainId
    ).address;
    const contract = DaiDripsHubAbi__factory.connect(
      daiDripsHubAddress,
      provider.getSigner()
    );

    return contract.collect(await provider.getSigner().getAddress(), []);
  }

  return {
    subscribe: state.subscribe,
    connect,
    disconnect,
    getRandomAccountId,
    pauseUnpause,
    createDrip,
    topUp,
    getDripsUpdatedEvents,
    getAllowance,
    getDaiBalance,
    approveDaiSpend,
    collect
  };
})();
