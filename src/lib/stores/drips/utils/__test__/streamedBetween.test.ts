import { streamedBetween } from '../streamedBetween';
import {
  workstreamActive,
  workstreamActiveOutput,
  workstreamPaused,
  workstreamPausedOutput,
  workstreamPendingSetup,
  workstreamPendingSetupOutput
} from './mockObjects';
import { eth } from './utils';

describe('streamedBetween', () => {
  it('returns an empty array if no workstreams have been passed', () => {
    expect(streamedBetween([])).toEqual([]);
  });

  it("returns empty amounts if a stream hasn't been set up", () => {
    expect(streamedBetween([workstreamPendingSetup])).toEqual([
      workstreamPendingSetupOutput
    ]);
  });

  it('returns multiple objects if multiple workstreams are passed', () => {
    expect(
      streamedBetween([workstreamPendingSetup, workstreamPendingSetup]).length
    ).toEqual(2);
  });

  it('correctly returns 1 eth as streamed amount for a stream that has streamed its entire balance of 1 eth', () => {
    expect(streamedBetween([workstreamActive()])).toEqual([
      workstreamActiveOutput()
    ]);
  });

  it('takes time windows into account', () => {
    expect(
      streamedBetween([workstreamActive()], {
        from: new Date(1000000000 * 1000), // exactly the second the stream was set up
        to: new Date(1000000004 * 1000) // 4 seconds later
      })
    ).toEqual([workstreamActiveOutput(4, eth(1))]);

    expect(
      streamedBetween([workstreamActive(eth(0.1), eth(1))], {
        from: new Date(1000000000 * 1000), // exactly the second the stream was set up
        to: new Date(1000000009 * 1000) // 9 seconds later
      })
    ).toEqual([workstreamActiveOutput(9, eth(1))]);

    expect(
      streamedBetween([workstreamActive(eth(0.1), eth(1))], {
        from: new Date(1000000000 * 1000), // exactly the second the stream was set up
        to: new Date(1000000011 * 1000) // 11 seconds later
      })
    ).toEqual([workstreamActiveOutput(11, eth(1))]);
  });

  it('calculates the streamed amount from the beginning of time until the current date by default', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(1000000001 * 1000)); // 1 second after stream was set up

    expect(streamedBetween([workstreamActive(eth(0.1), eth(1))])).toEqual([
      workstreamActiveOutput(1, eth(1))
    ]);

    jest.useRealTimers();
  });

  it('correctly calculates the total and remaining amount of a paused workstream', () => {
    expect(streamedBetween([workstreamPaused()])).toEqual([
      workstreamPausedOutput()
    ]);

    expect(streamedBetween([workstreamPaused(eth(0.1), eth(1), 7)])).toEqual([
      workstreamPausedOutput(eth(0.1), eth(1), 7)
    ]);

    expect(streamedBetween([workstreamPaused(eth(0.1), eth(1), 1)])).toEqual([
      workstreamPausedOutput(eth(0.1), eth(1), 1)
    ]);

    expect(
      streamedBetween([workstreamPaused(eth(0.25839), eth(2.2939), 1)])
    ).toEqual([workstreamPausedOutput(eth(0.25839), eth(2.2939), 1)]);
  });
});
