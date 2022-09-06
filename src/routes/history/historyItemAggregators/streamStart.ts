import type { HistoryAggregator } from '../history';
import { HistoryItemType, type HistoryItem } from '../types';

/* 
  Find the first drips updated event for each workstream and create
  a StreamStart history item.
*/
export const streamStart: HistoryAggregator = (_, streams) =>
  Object.values(streams).reduce<HistoryItem[]>((acc, ws) => {
    const timestamp = ws.onChainData?.dripHistory[0].timestamp;

    if (!timestamp) return acc;

    return [
      ...acc,
      {
        type: HistoryItemType.StreamStart,
        timestamp,
        meta: {
          workstream: ws,
          byAddress: ws.data.creator
        }
      }
    ];
  }, []);
