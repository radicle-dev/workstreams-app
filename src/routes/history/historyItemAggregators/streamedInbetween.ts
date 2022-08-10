import { amountsEarnedAndSpentBetween } from '$lib/stores/drips/utils/streamedBetween';
import { Currency } from '$lib/stores/workstreams/types';
import type { HistoryAggregator } from '../history';
import { HistoryItemType } from '../types';

/*
  Insert an "inbetween" item between subsequent history items, if any funds
  have been streamed from or to the user within the passed time.
*/
export const streamedInbetween: HistoryAggregator = (queue, streams) => {
  const newItems = [];

  queue.forEach((item, index) => {
    const prevItem = queue[index + 1];

    const { timestamp } = item;
    const prevTimestamp = prevItem?.timestamp || new Date();

    const window = {
      to: timestamp,
      from: prevTimestamp
    };

    const { earned, spent } = amountsEarnedAndSpentBetween(streams, window);

    if (earned.length > 0 || spent.length > 0) {
      newItems.push({
        type: HistoryItemType.StreamedInbetween,
        timestamp: new Date(item.timestamp.getTime() - 1),
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
