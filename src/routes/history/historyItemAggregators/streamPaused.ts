import type { HistoryAggregator } from '../history';
import { HistoryItemType, type StreamPaused } from '../types';

export const streamPaused: HistoryAggregator = (_, streams) =>
  streams.reduce<StreamPaused[]>((acc, ws) => {
    const events = ws.onChainData.dripsUpdatedEvents;

    // Get all updates that remove the drip to the recipient
    const pauses = events.filter(
      (dew) =>
        !dew.event.args.receivers.find(
          (r) => r.receiver.toLowerCase() === ws.data.acceptedApplication
        )
    );

    return [
      ...acc,
      ...pauses.map(
        (dew) =>
          ({
            type: HistoryItemType.StreamPaused,
            timestamp: new Date(dew.fromBlock.timestamp * 1000),
            meta: {
              workstream: ws
            }
          } as StreamPaused)
      )
    ];
  }, []);
