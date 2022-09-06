import type { HistoryAggregator } from '../history';
import { HistoryItemType, type StreamPaused } from '../types';

/*
  Get all drips updates that remove the drip to the recipient and create
  a StreamPaused history item for each.
*/
export const streamPaused: HistoryAggregator = (_, streams) =>
  streams.reduce<StreamPaused[]>((acc, ws) => {
    const { dripHistory } = ws.onChainData || {};
    if (!dripHistory) return [];

    const pauses = dripHistory.filter((e) => e.amtPerSec.wei === BigInt(0));

    return [
      ...acc,
      ...pauses.map(
        (e) =>
          ({
            type: HistoryItemType.StreamPaused,
            timestamp: e.timestamp,
            meta: {
              workstream: ws
            }
          } as StreamPaused)
      )
    ];
  }, []);
