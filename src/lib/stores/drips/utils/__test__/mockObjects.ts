import type { DripHistoryEvent } from '$lib/stores/workstreams';
import { Currency, type Money } from '$lib/stores/workstreams/types';

export const mockMoney = (amount: bigint | number | string): Money => ({
  wei: BigInt(amount),
  currency: Currency.DAI
});

export const mockDripHistoryEvent = ({
  balance,
  amtPerSec,
  seconds
}: {
  balance: Money;
  amtPerSec: Money;
  seconds: number;
}): DripHistoryEvent => ({
  balance,
  timestamp: new Date(seconds * 1000),
  amtPerSec
});
