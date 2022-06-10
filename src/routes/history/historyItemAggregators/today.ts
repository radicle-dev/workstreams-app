import streamedBetween from '$lib/stores/drips/utils/streamedBetween';
import { Currency } from '$lib/stores/workstreams/types';
import type { HistoryAggregator } from '../history';
import { HistoryItemType } from '../types';

export const today: HistoryAggregator = (queue, streams) => {
  if (queue.length === 0) return [];

  const window = {
    to: new Date(),
    from: new Date(
      queue[0].timestamp.getFullYear(),
      queue[0].timestamp.getMonth()
    )
  };

  const { earned, spent } = streamedBetween(window, streams);

  return [
    {
      type: HistoryItemType.MonthStartInbetween,
      timestamp: new Date(),
      meta: {
        earned: {
          total: {
            currency: Currency.DAI,
            wei: earned.reduce<bigint>(
              (acc, v) => acc + v.amount.wei,
              BigInt(0)
            )
          },
          streams: earned
        },
        spent: {
          total: {
            currency: Currency.DAI,
            wei: spent.reduce<bigint>((acc, v) => acc + v.amount.wei, BigInt(0))
          },
          streams: spent
        },
        secs: Math.floor(
          window.to.getTime() / 1000 - window.from.getTime() / 1000
        ),
        window: {
          from: window.from,
          to: window.to
        }
      }
    }
  ];
};
