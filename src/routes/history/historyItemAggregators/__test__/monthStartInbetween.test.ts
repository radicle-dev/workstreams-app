import type { EnrichedWorkstream } from '$lib/stores/workstreams';
import { mock } from 'jest-mock-extended';
import { type HistoryItem, HistoryItemType } from '../../types';
import { monthStartInbetween } from '../monthStartInbetween';

const streams = [
  mock<EnrichedWorkstream>({
    onChainData: {
      dripHistory: [
        {
          amtPerSec: {
            wei: BigInt(1)
          },
          balance: {
            wei: BigInt(2678400 * 1000)
          },
          timestamp: new Date(0)
        }
      ]
    },
    direction: 'incoming'
  })
];

describe('monthStartInbetween', () => {
  it("doesn't add a history item after the first event", () => {
    const startDate = new Date(2678400 * 1000);
    const nextMonth = new Date(5097600 * 1000);

    const historyItems = [
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: startDate
      }),
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: nextMonth
      })
    ];

    expect(monthStartInbetween(historyItems, streams)).toEqual([]);
  });

  it("doesn't add a monthStartInbetween item between two items that are not in different months", () => {
    const historyItems = [
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: new Date(0)
      }),
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: new Date(60 * 1000)
      }),
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: new Date(120 * 1000)
      })
    ];

    expect(monthStartInbetween(historyItems, streams)).toEqual([]);
  });

  it('inserts a monthStartInbetween item inbetween two months', () => {
    const startDate = new Date(2678400 * 1000);
    const nextMonth = new Date(5097600 * 1000);

    const historyItems = [
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: new Date(0)
      }),
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: startDate
      }),
      mock<HistoryItem>({
        type: HistoryItemType.StreamStart,
        timestamp: nextMonth
      })
    ];

    expect(monthStartInbetween(historyItems, streams)[0]).toMatchObject({
      type: HistoryItemType.MonthStartInbetween,
      timestamp: new Date(startDate.getUTCFullYear(), startDate.getUTCMonth()),
      meta: {
        secs: 2678400,
        window: {
          from: new Date(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth() - 1
          ),
          to: new Date(startDate.getUTCFullYear(), startDate.getUTCMonth())
        }
      }
    });
  });
});
