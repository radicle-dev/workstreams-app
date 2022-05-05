import query from '$lib/api';
import { GET_DRIPS_CONFIGS } from '$lib/api/queries';
import type {
  DripsConfigs,
  DripsConfigsVariables,
  DripsConfigs_dripsConfigs_receivers
} from '$lib/api/__generated__/DripsConfigs';
import type { Provider } from '@ethersproject/abstract-provider';
import { BigNumber, Contract } from 'ethers';
import { get, writable } from 'svelte/store';
import { walletStore } from '../wallet/wallet';
import daiDripsHubInfo from './contracts/DaiDripsHub';
import type { ContractInfoFactory } from './contracts/types';

function getContract(
  infoFunc: ContractInfoFactory,
  chainId: number,
  provider: Provider
) {
  const info = infoFunc(chainId);
  return new Contract(info.address, info.abi, provider);
}

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

export default (() => {
  const { subscribe } = writable();

  async function createDrip(
    account: number,
    topUpAmt = 0,
    receivers: { receiver: string; amtPerSec: number }[] = []
  ) {
    const ws = get(walletStore);

    if (!ws.connected) throw new Error('Connect your wallet first.');
    if (!ws.provider) throw new Error('No Provider available.');

    const contract = getContract(
      daiDripsHubInfo,
      ws.chainId,
      ws.provider
    ).connect(ws.provider.getSigner());

    const lastUpdate = await query<DripsConfigs, DripsConfigsVariables>({
      query: GET_DRIPS_CONFIGS,
      variables: {
        id: ws.accounts[0]
      },
      chainId: ws.chainId
    });

    let callConfig = {
      balance: 0,
      timestamp: 0,
      receivers: [],
      withdrawable: BigNumber.from(0)
    };

    console.log(lastUpdate);

    if (lastUpdate.dripsConfigs.length !== 0) {
      const { balance, timestamp, receivers } = lastUpdate.dripsConfigs[0];

      callConfig = {
        balance,
        timestamp,
        receivers,
        withdrawable: getDripsWithdrawable(receivers, balance, timestamp)
      };
    }

    return contract[
      'setDrips(uint256,uint64,uint128,(address,uint128)[],int128,(address,uint128)[])'
    ](
      account,
      callConfig.timestamp,
      callConfig.balance,
      callConfig.receivers,
      topUpAmt,
      receivers
    );
  }

  return {
    subscribe,
    createDrip
  };
})();
