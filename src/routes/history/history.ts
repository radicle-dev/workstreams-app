import type { EnrichedWorkstream } from '$lib/stores/workstreams';
import { writable } from 'svelte/store';
import type { History, HistoryItem } from './types';

export type HistoryAggregator = (
  queue: History,
  streams: EnrichedWorkstream[]
) => HistoryItem[];

const state = writable<History>([]);

let queue: History = [];
let streams: EnrichedWorkstream[] = [];

const historyItemComparator = (a: HistoryItem, b: HistoryItem) => {
  if (a.timestamp < b.timestamp) {
    return 1;
  }
  if (a.timestamp > b.timestamp) {
    return -1;
  }
  return 0;
};

/**
 * Set relevant streams for the history, which will be passed to each
 * aggregator passed to `add`.
 */
function setStreams(newStreams: EnrichedWorkstream[]): typeof history {
  streams = newStreams;

  return history;
}

/**
 * Add items to a temporary history item queue. Returns self for
 * easy chaining. New items will not appear in the state until `flush`
 * is called.
 */
function add(aggregator: HistoryAggregator): typeof history {
  const newState = queue;

  newState.push(...aggregator(queue, streams));
  newState.sort(historyItemComparator);

  queue = newState;

  return history;
}

/**
 * Take all items added to the queue via `add`, and update the
 * history state. Flushes the queue and streams.
 */
function flush(): typeof history {
  state.set(queue);
  queue = [];
  streams = [];

  return history;
}

const history = {
  subscribe: state.subscribe,
  add,
  setStreams,
  flush
};

export default history;
