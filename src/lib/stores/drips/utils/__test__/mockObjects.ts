import type { DripHistoryEvent } from '$lib/stores/workstreams';
import { Currency, type Money } from '$lib/stores/workstreams/types';

export const createMoney = (
  amount: bigint | number | string,
  currency = Currency.DAI
): Money => ({
  wei: BigInt(amount),
  currency
});

export const createDripHistoryEvent = ({
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
