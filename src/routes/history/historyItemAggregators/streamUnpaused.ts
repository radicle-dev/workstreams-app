import type { HistoryAggregator } from '../history';
import { HistoryItemType, type StreamUnpaused } from '../types';

export const streamUnpaused: HistoryAggregator = (_, streams) =>
  streams.reduce<StreamUnpaused[]>((acc, ws) => {
    const events = ws.onChainData.dripsUpdatedEvents;

    const unpauses = events.filter((dew, index) => {
      const prevDew = events[index - 1];

      const prevDewPaused =
        prevDew &&
        !prevDew.event.args.receivers.find(
          (r) => r.receiver.toLowerCase() === ws.data.acceptedApplication
        );

      return (
        prevDewPaused &&
        dew.event.args.receivers.find(
          (r) => r.receiver.toLowerCase() === ws.data.acceptedApplication
        )
      );
    });

    return [
      ...acc,
      ...unpauses.map(
        (dew) =>
          ({
            type: HistoryItemType.StreamUnpaused,
            timestamp: new Date(dew.fromBlock.timestamp * 1000),
            meta: {
              workstream: ws
            }
          } as StreamUnpaused)
      )
    ];
  }, []);
