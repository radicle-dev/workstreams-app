import { mock } from 'jest-mock-extended';
import type { EnrichedWorkstream } from '$lib/stores/workstreams';
import { streamedInbetween } from '../streamedInbetween';
import { HistoryItemType, type HistoryItem } from '../../types';

const stream = (amtPerSec: number, direction: 'incoming' | 'outgoing') =>
  mock<EnrichedWorkstream>({
    onChainData: {
      dripHistory: [
        {
          amtPerSec: {
            wei: BigInt(amtPerSec)
          },
          balance: {
            wei: BigInt(10000)
          },
          timestamp: new Date(0)
        }
      ]
    },
    direction
  });

describe('streamedInbetween history aggregator', () => {
  it("doesn't add an item if nothing has been streamed", () => {
    const historyItems = [
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: new Date(60 * 1000)
      }),
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: new Date(0)
      })
    ];

    const streams = [stream(0, 'incoming')];

    expect(streamedInbetween(historyItems, streams)).toEqual([]);
  });

  it('adds an item if something was streamed between two items', () => {
    const historyItems = [
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: new Date(60 * 1000)
      }),
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: new Date(0)
      })
    ];

    const streams = [stream(1, 'incoming'), stream(2, 'outgoing')];

    expect(streamedInbetween(historyItems, streams)[0]).toMatchObject({
      type: HistoryItemType.StreamedInbetween,
      timestamp: new Date(60 * 1000 - 1), // 1 millisecond before the younger item
      meta: {
        earned: {
          total: {
            wei: BigInt(60)
          }
        },
        spent: {
          total: {
            wei: BigInt(120)
          }
        }
      }
    });
  });
});
