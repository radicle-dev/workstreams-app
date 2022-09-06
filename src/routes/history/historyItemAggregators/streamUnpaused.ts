import type { HistoryAggregator } from '../history';
import { HistoryItemType, type StreamUnpaused } from '../types';

/* 
  Aggregate all events that add a drip to the recipient after the
  previous event removed it.
*/
export const streamUnpaused: HistoryAggregator = (_, streams) =>
  streams.reduce<StreamUnpaused[]>((acc, ws) => {
    const { dripHistory } = ws.onChainData || {};
    if (!dripHistory) return acc;

    const unpauses = dripHistory.filter((e, index) => {
      const prevEvent = dripHistory[index - 1];

      const prevDewPaused = prevEvent?.amtPerSec.wei === BigInt(0);

      return prevDewPaused && e.amtPerSec.wei !== BigInt(0);
    });

    return [
      ...acc,
      ...unpauses.map(
        (e) =>
          ({
            type: HistoryItemType.StreamUnpaused,
            timestamp: e.timestamp,
            meta: {
              workstream: ws
            }
          } as StreamUnpaused)
      )
    ];
  }, []);
