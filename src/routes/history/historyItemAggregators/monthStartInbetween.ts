import { amountsEarnedAndSpentBetween } from '$lib/stores/drips/utils/streamedBetween';
import { Currency } from '$lib/stores/workstreams/types';
import type { HistoryAggregator } from '../history';
import { HistoryItemType, type HistoryItem } from '../types';

/*
  If a new month started inbetween two history items, insert a "month start
  inbetween", which sums up the amounts earned and spent in the completed month.
*/
export const monthStartInbetween: HistoryAggregator = (queue, streams) => {
  const newItems: HistoryItem[] = [];

  queue.forEach((item, index) => {
    if (index === 0) return;

    const nextItem = queue[index + 1];

    const { timestamp } = item;

    if (
      nextItem &&
      nextItem.timestamp.getUTCMonth() !== timestamp.getUTCMonth()
    ) {
      const monthEnd = new Date(
        timestamp.getUTCFullYear(),
        timestamp.getUTCMonth()
      );
      const monthStart = new Date(
        timestamp.getUTCFullYear(),
        timestamp.getUTCMonth() - 1
      );

      const window = {
        from: monthStart,
        to: monthEnd
      };

      const { earned, spent } = amountsEarnedAndSpentBetween(streams, window);

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
