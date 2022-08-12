import { flattenDripHistory } from '../streamedBetween';
import { mockDripHistoryEvent, mockMoney } from './mockObjects';
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

  it('correctly returns 1 dai as streamed amount for a stream that has streamed its entire balance of 1 dai', () => {
    expect(
      flattenDripHistory([
        mockDripHistoryEvent({
          balance: mockMoney(eth(1)),
          amtPerSec: mockMoney(eth(0.1)),
          seconds: 0
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
          mockDripHistoryEvent({
            balance: mockMoney(eth(1)),
            amtPerSec: mockMoney(eth(0.1)),
            seconds: 0
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
          mockDripHistoryEvent({
            balance: mockMoney(eth(1)),
            amtPerSec: mockMoney(eth(0.1)),
            seconds: 0
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
          mockDripHistoryEvent({
            balance: mockMoney(eth(1)),
            amtPerSec: mockMoney(eth(0.1)),
            seconds: 0
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

  it('calculates the streamed amount from the beginning of time until the current date by default', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(1 * 1000)); // 1 second after stream was set up

    expect(
      flattenDripHistory([
        mockDripHistoryEvent({
          balance: mockMoney(eth(1)),
          amtPerSec: mockMoney(eth(0.1)),
          seconds: 0
        })
      ])
    ).toEqual({
      amountStreamed: eth(0.1),
      amountRemaining: eth(0.9)
    });

    jest.useRealTimers();
  });

  it('correctly calculates the total and remaining amount of a paused workstream', () => {
    expect(
      flattenDripHistory([
        mockDripHistoryEvent({
          balance: mockMoney(eth(1)),
          amtPerSec: mockMoney(eth(0.1)),
          seconds: 0
        }),
        mockDripHistoryEvent({
          balance: mockMoney(eth(0.5)),
          amtPerSec: mockMoney(eth(0)),
          seconds: 5
        })
      ])
    ).toEqual({
      amountStreamed: eth(0.5),
      amountRemaining: eth(0.5)
    });

    expect(
      flattenDripHistory([
        mockDripHistoryEvent({
          balance: mockMoney(eth(1)),
          amtPerSec: mockMoney(eth(0.1)),
          seconds: 0
        }),
        mockDripHistoryEvent({
          balance: mockMoney(eth(0.3)),
          amtPerSec: mockMoney(eth(0)),
          seconds: 7
        })
      ])
    ).toEqual({
      amountStreamed: eth(0.7),
      amountRemaining: eth(0.3)
    });

    expect(
      flattenDripHistory([
        mockDripHistoryEvent({
          balance: mockMoney(eth(1)),
          amtPerSec: mockMoney(eth(0.1)),
          seconds: 0
        }),
        mockDripHistoryEvent({
          balance: mockMoney(eth(0)),
          amtPerSec: mockMoney(eth(0)),
          seconds: 10
        })
      ])
    ).toEqual({
      amountStreamed: eth(1),
      amountRemaining: eth(0)
    });

    expect(
      flattenDripHistory(
        [
          mockDripHistoryEvent({
            balance: mockMoney(eth(2)),
            amtPerSec: mockMoney(eth(0.1)),
            seconds: 0
          }),
          mockDripHistoryEvent({
            balance: mockMoney(eth(0.5)),
            amtPerSec: mockMoney(eth(0)),
            seconds: 15
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
        mockDripHistoryEvent({
          balance: mockMoney(eth(5)),
          amtPerSec: mockMoney(eth(0.1)),
          seconds: 0
        }),
        mockDripHistoryEvent({
          balance: mockMoney(eth(4.5)),
          amtPerSec: mockMoney(eth(0)),
          seconds: 5
        }),
        mockDripHistoryEvent({
          balance: mockMoney(eth(4.5)),
          amtPerSec: mockMoney(eth(1)),
          seconds: 10
        }),
        mockDripHistoryEvent({
          balance: mockMoney(eth(2.5)),
          amtPerSec: mockMoney(eth(0)),
          seconds: 12
        })
      ])
    ).toEqual({
      amountStreamed: eth(2.5),
      amountRemaining: eth(2.5)
    });
  });
});
