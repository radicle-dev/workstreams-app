import type { EnrichedWorkstream } from '$lib/stores/workstreams';
import type { Money } from '$lib/stores/workstreams';

export enum HistoryItemType {
  MonthStartInbetween,
  Withdrawal,
  StreamedInbetween,
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
  meta: {
    earned: {
      total: Money;
      streams: { workstream: EnrichedWorkstream; amount: Money }[];
    };
    spent: {
      total: Money;
      streams: { workstream: EnrichedWorkstream; amount: Money }[];
    };
    secs: number;
    window: {
      from: Date;
      to: Date;
    };
  };
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
    byAddress: string;
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
    byAddress: string;
  };
}

export interface StreamToppedUp extends HistoryItemBase {
  type: HistoryItemType.StreamToppedUp;
  meta: {
    workstream: EnrichedWorkstream;
    amount: Money;
    byAddress: string;
  };
}

export interface StreamUnpaused extends HistoryItemBase {
  type: HistoryItemType.StreamUnpaused;
  meta: {
    workstream: EnrichedWorkstream;
    byAddress: string;
  };
}

export interface StreamedInbetween extends HistoryItemBase {
  type: HistoryItemType.StreamedInbetween;
  meta: {
    earned: {
      total: Money;
      streams: { workstream: EnrichedWorkstream; amount: Money }[];
    };
    spent: {
      total: Money;
      streams: { workstream: EnrichedWorkstream; amount: Money }[];
    };
    secs: number;
    window: {
      from: Date;
      to: Date;
    };
  };
}

export type HistoryItem =
  | MonthStartInbetween
  | StreamedInbetween
  | Withdrawal
  | StreamStart
  | StreamOutOfFunds
  | StreamPaused
  | StreamToppedUp
  | StreamUnpaused;

export type History = HistoryItem[];
