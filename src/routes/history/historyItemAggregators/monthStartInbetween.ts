import streamedBetween from '$lib/stores/drips/utils/streamedBetween';
import { Currency } from '$lib/stores/workstreams/types';
import type { HistoryAggregator } from '../history';
import { HistoryItemType } from '../types';

export const monthStartInbetween: HistoryAggregator = (queue, streams) => {
  const newItems = [];

  queue.forEach((item, index) => {
    if (index === 0) return;

    const nextItem = queue[index + 1];

    const { timestamp } = item;

    if (nextItem && nextItem.timestamp.getMonth() < timestamp.getMonth()) {
      const monthEnd = new Date(timestamp.getFullYear(), timestamp.getMonth());
      const monthStart = new Date(
        timestamp.getFullYear(),
        timestamp.getMonth() - 1
      );

      const window = {
        from: monthStart,
        to: monthEnd
      };

      const { earned, spent } = streamedBetween(window, streams);

      newItems.push({
        type: HistoryItemType.MonthStartInbetween,
        timestamp: monthEnd,
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
              wei: spent.reduce<bigint>(
                (acc, v) => acc + v.amount.wei,
                BigInt(0)
              )
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
      });
    }
  });

  return newItems;
};
