import type { HistoryAggregator } from '../history';
import {
  HistoryItemType,
  type StreamOutOfFunds,
  type StreamToppedUp
} from '../types';

/* 
  Calculate all timestamps of when a particular stream ran out of funds
  and insert a history item. Check if the workstream was topped up after,
  and if yes, also add a top up history item.
*/
export const streamStartStop: HistoryAggregator = (_, streams) => {
  const aggregation = Object.values(streams).reduce<{
    outOfFunds: StreamOutOfFunds[];
    toppedUp: StreamToppedUp[];
  }>(
    (acc, ws) => {
      const { dripHistory } = ws.onChainData || {};
      if (!dripHistory) return acc;

      let newOutOfFundsItems: StreamOutOfFunds[] = [];
      let newToppedUpItems: StreamToppedUp[] = [];

      dripHistory.forEach((e, index) => {
        const { amtPerSec, timestamp, balance } = e;

        const nextEvent = dripHistory[index + 1];

        if (amtPerSec.wei === BigInt(0)) return acc;

        const streamingUntil =
          timestamp.getTime() / 1000 + Number(balance.wei / amtPerSec.wei);
        const nextTimestamp =
          (nextEvent?.timestamp || new Date()).getTime() / 1000;

        if (streamingUntil > nextTimestamp) {
          return acc;
        }

        newOutOfFundsItems = [
          ...newOutOfFundsItems,
          {
            type: HistoryItemType.StreamOutOfFunds,
            timestamp: new Date(streamingUntil * 1000),
            meta: {
              workstream: ws
            }
          }
        ];

        const wasToppedUpAfter =
          nextEvent && nextEvent.balance.wei !== BigInt(0);

        newToppedUpItems = wasToppedUpAfter
          ? [
              ...newToppedUpItems,
              {
                type: HistoryItemType.StreamToppedUp,
                timestamp: nextEvent.timestamp,
                meta: {
                  workstream: ws,
                  amount: nextEvent.balance,
                  byAddress: ws.data.creator
                }
              }
            ]
          : newToppedUpItems;
      });

      return {
        outOfFunds: [...acc.outOfFunds, ...newOutOfFundsItems],
        toppedUp: [...acc.toppedUp, ...newToppedUpItems]
      };
    },
    { outOfFunds: [], toppedUp: [] }
  );

  return [...aggregation.outOfFunds, ...aggregation.toppedUp];
};
