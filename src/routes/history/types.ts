import type { EnrichedWorkstream } from '$lib/stores/workstreams';
import type { Money } from '$lib/stores/workstreams/types';

export enum HistoryItemType {
  MonthStartInbetween,
  Withdrawal,
  EarnedInbetween,
  StreamStart,
  StreamOutOfFunds,
  StreamPaused,
  StreamUnpaused,
  StreamToppedUp
}

export interface HistoryItemBase {
  timestamp: Date;
  type: HistoryItemType;
}

export interface MonthStartInbetween extends HistoryItemBase {
  type: HistoryItemType.MonthStartInbetween;
}

export interface Withdrawal extends HistoryItemBase {
  type: HistoryItemType.Withdrawal;
  meta: {
    amount: Money;
    toAddress: string;
  };
}

export interface StreamStart extends HistoryItemBase {
  type: HistoryItemType.StreamStart;
  meta: {
    workstream: EnrichedWorkstream;
  };
}

export interface StreamOutOfFunds extends HistoryItemBase {
  type: HistoryItemType.StreamOutOfFunds;
  meta: {
    workstream: EnrichedWorkstream;
  };
}

export interface StreamPaused extends HistoryItemBase {
  type: HistoryItemType.StreamPaused;
  meta: {
    workstream: EnrichedWorkstream;
  };
}

export interface StreamToppedUp extends HistoryItemBase {
  type: HistoryItemType.StreamToppedUp;
  meta: {
    workstream: EnrichedWorkstream;
  };
}

export interface StreamUnpaused extends HistoryItemBase {
  type: HistoryItemType.StreamUnpaused;
  meta: {
    workstream: EnrichedWorkstream;
  };
}

export interface EarnedInbetween extends HistoryItemBase {
  type: HistoryItemType.EarnedInbetween;
  meta: {
    earned: { workstream: EnrichedWorkstream; amount: Money }[];
    total: Money;
    secs: number;
    window: {
      from: Date;
      to: Date;
    };
  };
}

export type HistoryItem =
  | MonthStartInbetween
  | EarnedInbetween
  | Withdrawal
  | StreamStart
  | StreamOutOfFunds
  | StreamPaused
  | StreamToppedUp
  | StreamUnpaused;

export type History = HistoryItem[];
