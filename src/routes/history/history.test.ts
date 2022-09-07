import { mock } from 'jest-mock-extended';

import type { EnrichedWorkstream } from '$lib/stores/workstreams';
import history from './history';
import type { HistoryItem } from './types';
import { get } from 'svelte/store';

afterEach(() => {
  history.clear();
});

describe('history', () => {
  it('sends relevant streams to aggregator functions', () => {
    const mockStream1 = mock<EnrichedWorkstream>();
    const mockStream2 = mock<EnrichedWorkstream>();

    const aggregator = jest.fn(() => []);

    history.setStreams([mockStream1, mockStream2]).add(aggregator);

    expect(aggregator).toBeCalledWith([], [mockStream1, mockStream2]);
  });

  it('adds history items to the queue, but not to history itself before flush', () => {
    const mockHistoryItem = mock<HistoryItem>();
    const aggregator1 = jest.fn(() => [mockHistoryItem]);
    const aggregator2 = jest.fn(() => []);
    const aggregator3 = jest.fn(() => []);

    history.add(aggregator1).add(aggregator2).add(aggregator3);

    expect(aggregator2).toBeCalledWith([mockHistoryItem], []);
    expect(aggregator3).toBeCalledWith([mockHistoryItem], []);
    expect(get(history)).toEqual([]);
  });

  it('adds history items to the history once flushed', () => {
    const mockHistoryItem = mock<HistoryItem>();
    const aggregator1 = jest.fn(() => [mockHistoryItem]);

    history.add(aggregator1).add(aggregator1);

    expect(get(history)).toEqual([]);

    history.add(aggregator1).flush();

    expect(get(history)).toEqual([
      mockHistoryItem,
      mockHistoryItem,
      mockHistoryItem
    ]);
  });
});

export {};
