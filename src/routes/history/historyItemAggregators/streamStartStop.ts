import { Currency } from '$lib/stores/workstreams/types';
import type { HistoryAggregator } from '../history';
import {
  HistoryItemType,
  type StreamOutOfFunds,
  type StreamToppedUp
} from '../types';

export const streamStartStop: HistoryAggregator = (_, streams) => {
  const aggregation = Object.values(streams).reduce<{
    outOfFunds: StreamOutOfFunds[];
    toppedUp: StreamToppedUp[];
  }>(
    (acc, ws) => {
      const events = ws.onChainData.dripsUpdatedEvents;

      let newOutOfFundsItems: StreamOutOfFunds[] = [];
      let newToppedUpItems: StreamToppedUp[] = [];

      events.forEach((wrapper, index) => {
        const { event, fromBlock } = wrapper;
        const { receivers, balance } = event.args;

        const amtPerSec = receivers.reduce<bigint>(
          (acc, r) => acc + r.amtPerSec.toBigInt(),
          BigInt(0)
        );

        if (!amtPerSec) {
          return acc;
        }

        const nextEvent = events[index + 1];
        const streamingUntil =
          fromBlock.timestamp + Number(balance.toBigInt() / amtPerSec);
        const nextTimestamp =
          nextEvent?.fromBlock.timestamp || new Date().getTime() / 1000;

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
          nextEvent && nextEvent.event.args.balance.toBigInt() !== BigInt(0);

        newToppedUpItems = wasToppedUpAfter
          ? [
              ...newToppedUpItems,
              {
                type: HistoryItemType.StreamToppedUp,
                timestamp: new Date(nextEvent.fromBlock.timestamp * 1000),
                meta: {
                  workstream: ws,
                  amount: {
                    currency: Currency.DAI,
                    wei: nextEvent.event.args.balance.toBigInt()
                  },
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
