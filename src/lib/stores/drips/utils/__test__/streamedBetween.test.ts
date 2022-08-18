import { flattenDripHistory } from '../streamedBetween';
import { createDripHistoryEvent, createMoney } from './mockObjects';
import { eth } from './utils';

afterEach(() => {
  jest.useRealTimers();
});

describe('flattenDripHistory', () => {
  it('returns zero amounts if empty history is passed', () => {
    expect(flattenDripHistory([])).toEqual({
      amountStreamed: eth(0),
      amountRemaining: eth(0)
    });
  });

  it('calculates the streamed amount from the beginning of time until the current date by default', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(1 * 1000)); // 1 second after stream was set up

    expect(
      flattenDripHistory([
        createDripHistoryEvent({
          balance: createMoney(eth(1)),
          amtPerSec: createMoney(eth(0.1)),
          timestampSeconds: 0
        })
      ])
    ).toEqual({
      amountStreamed: eth(0.1),
      amountRemaining: eth(0.9)
    });

    jest.useRealTimers();
  });

  it('returns 1 dai for a stream that has streamed its entire balance of 1 dai', () => {
    expect(
      flattenDripHistory([
        createDripHistoryEvent({
          balance: createMoney(eth(1)),
          amtPerSec: createMoney(eth(0.1)),
          timestampSeconds: 0
        })
      ])
    ).toEqual({
      amountStreamed: eth(1),
      amountRemaining: eth(0)
    });
  });

  it('takes time windows into account', () => {
    expect(
      flattenDripHistory(
        [
          createDripHistoryEvent({
            balance: createMoney(eth(1)),
            amtPerSec: createMoney(eth(0.1)),
            timestampSeconds: 0
          })
        ],
        {
          from: new Date(0 * 1000), // exactly the second the stream was set up
          to: new Date(4 * 1000) // 4 seconds later
        }
      )
    ).toEqual({
      amountStreamed: eth(0.4),
      amountRemaining: eth(0.6)
    });

    expect(
      flattenDripHistory(
        [
          createDripHistoryEvent({
            balance: createMoney(eth(1)),
            amtPerSec: createMoney(eth(0.1)),
            timestampSeconds: 0
          })
        ],
        {
          from: new Date(0 * 1000), // exactly the second the stream was set up
          to: new Date(9 * 1000) // 9 seconds later
        }
      )
    ).toEqual({
      amountStreamed: eth(0.9),
      amountRemaining: eth(0.1)
    });

    expect(
      flattenDripHistory(
        [
          createDripHistoryEvent({
            balance: createMoney(eth(1)),
            amtPerSec: createMoney(eth(0.1)),
            timestampSeconds: 0
          })
        ],
        {
          from: new Date(0 * 1000), // exactly the second the stream was set up
          to: new Date(11 * 1000) // 11 seconds later
        }
      )
    ).toEqual({
      amountStreamed: eth(1),
      amountRemaining: eth(0)
    });
  });

  it('correctly calculates the total and remaining amount of a paused workstream', () => {
    expect(
      flattenDripHistory([
        createDripHistoryEvent({
          balance: createMoney(eth(1)),
          amtPerSec: createMoney(eth(0.1)),
          timestampSeconds: 0
        }),
        createDripHistoryEvent({
          balance: createMoney(eth(0.5)),
          amtPerSec: createMoney(eth(0)),
          timestampSeconds: 5
        })
      ])
    ).toEqual({
      amountStreamed: eth(0.5),
      amountRemaining: eth(0.5)
    });

    expect(
      flattenDripHistory([
        createDripHistoryEvent({
          balance: createMoney(eth(1)),
          amtPerSec: createMoney(eth(0.1)),
          timestampSeconds: 0
        }),
        createDripHistoryEvent({
          balance: createMoney(eth(0.3)),
          amtPerSec: createMoney(eth(0)),
          timestampSeconds: 7
        })
      ])
    ).toEqual({
      amountStreamed: eth(0.7),
      amountRemaining: eth(0.3)
    });

    expect(
      flattenDripHistory([
        createDripHistoryEvent({
          balance: createMoney(eth(1)),
          amtPerSec: createMoney(eth(0.1)),
          timestampSeconds: 0
        }),
        createDripHistoryEvent({
          balance: createMoney(eth(0)),
          amtPerSec: createMoney(eth(0)),
          timestampSeconds: 10
        })
      ])
    ).toEqual({
      amountStreamed: eth(1),
      amountRemaining: eth(0)
    });

    expect(
      flattenDripHistory(
        [
          createDripHistoryEvent({
            balance: createMoney(eth(2)),
            amtPerSec: createMoney(eth(0.1)),
            timestampSeconds: 0
          }),
          createDripHistoryEvent({
            balance: createMoney(eth(0.5)),
            amtPerSec: createMoney(eth(0)),
            timestampSeconds: 15
          })
        ],
        {
          from: new Date(0 * 1000), // exactly the second the stream was set up,
          to: new Date(10 * 1000) // 10 seconds later
        }
      )
    ).toEqual({
      amountStreamed: eth(1),
      amountRemaining: eth(1)
    });
  });

  it('handles unpauses and different amtPerSec', () => {
    expect(
      flattenDripHistory([
        createDripHistoryEvent({
          balance: createMoney(eth(5)),
          amtPerSec: createMoney(eth(0.1)),
          timestampSeconds: 0
        }),
        createDripHistoryEvent({
          balance: createMoney(eth(4.5)),
          amtPerSec: createMoney(eth(0)),
          timestampSeconds: 5
        }),
        createDripHistoryEvent({
          balance: createMoney(eth(4.5)),
          amtPerSec: createMoney(eth(1)),
          timestampSeconds: 10
        }),
        createDripHistoryEvent({
          balance: createMoney(eth(2.5)),
          amtPerSec: createMoney(eth(0)),
          timestampSeconds: 12
        })
      ])
    ).toEqual({
      amountStreamed: eth(2.5),
      amountRemaining: eth(2.5)
    });
  });
});
