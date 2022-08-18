import { toWei } from 'web3-utils';
import type { DripHistoryEvent } from '$lib/stores/workstreams';
import { Currency, type Money } from '$lib/stores/workstreams/types';

export const eth = (amount: number) => BigInt(toWei(String(amount), 'ether'));

export const money = (
  amount: bigint | number | string,
  currency = Currency.DAI
): Money => ({
  wei: BigInt(amount),
  currency
});

export const dripHistoryEvent = ({
  balance,
  amtPerSec,
  timestampSeconds
}: {
  balance: Money;
  amtPerSec: Money;
  timestampSeconds: number;
}): DripHistoryEvent => ({
  balance,
  timestamp: new Date(timestampSeconds * 1000),
  amtPerSec
});
