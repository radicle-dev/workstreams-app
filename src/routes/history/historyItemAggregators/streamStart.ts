import type { HistoryAggregator } from '../history';
import { HistoryItemType } from '../types';

/* 
  Find the first drips updated event for each workstream and create
  a StreamStart history item.
*/
export const streamStart: HistoryAggregator = (_, streams) =>
  Object.values(streams).map((ws) => {
    const timestamp = new Date(
      ws.onChainData.dripsUpdatedEvents[0].fromBlock.timestamp * 1000
    );

    return {
      type: HistoryItemType.StreamStart,
      timestamp,
      meta: {
        workstream: ws,
        byAddress: ws.data.creator
      }
    };
  });
