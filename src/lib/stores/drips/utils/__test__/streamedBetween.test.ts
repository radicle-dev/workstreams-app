import type {
  DrippingEventWrapper,
  EnrichedWorkstream
} from '$lib/stores/workstreams';
import bigIntMax from '$lib/stores/workstreams/methods/bigIntMax';
import bigIntMin from '$lib/stores/workstreams/methods/bigIntMin';
import {
  Currency,
  WorkstreamState,
  type Workstream
} from '$lib/stores/workstreams/types';
import { BigNumber } from 'ethers';
import { toWei } from 'web3-utils';
import { streamedBetween } from '../streamedBetween';

const eth = (amount: number) => BigInt(toWei(String(amount), 'ether'));

const mockWorkstreamData = (
  state: WorkstreamState = WorkstreamState.ACTIVE,
  id = 'c2003033-5544-489a-bf56-b3e104677952'
): Workstream => ({
  acceptedApplication: '0x71e686c1b95e8a1faa636ea046b97ea985e248d0',
  ratePerSecond: mockMoney('11574074074074074'),
  creator: '0xec7e75f94297b479029b9213f8bbacbb60015c17',
  desc: 'test',
  created_at: { _seconds: 1652875579, _nanoseconds: 394000000 },
  applicationsToReview: [],
  dripsData: { chainId: 4, accountId: BigInt(0) },
  state,
  id,
  total: mockMoney('999999999999999993600'),
  durationDays: 1,
  applicants: ['0x71e686c1b95e8a1faa636ea046b97ea985e248d0'],
  title: 'Test'
});

const mockMoney = (wei: string | number | bigint) => ({
  currency: Currency.DAI,
  wei: BigInt(wei)
});

const workstreamPendingSetup: EnrichedWorkstream = {
  data: mockWorkstreamData(
    WorkstreamState.ACTIVE,
    'b51d7afd-4724-4319-9b86-d9466c9a1b9e'
  ),
  onChainData: {
    amtPerSec: mockMoney(0),
    dripsEntries: [],
    dripsAccount: undefined,
    streamSetUp: false,
    dripsUpdatedEvents: []
  },
  fetchedAt: new Date(),
  relevant: true,
  direction: 'outgoing'
};
const workstreamPendingSetupOutput = {
  workstream: workstreamPendingSetup,
  remaining: mockMoney(0),
  amount: mockMoney(0)
};

const mockDrippingEventWrapper = (
  balance = eth(1),
  amtPerSec = eth(0.1),
  timestamp = 1000000000
) =>
  ({
    fromBlock: {
      hash: '0x00',
      parentHash: '0x00',
      number: 10702263,
      timestamp,
      nonce: '0x0000000000000000',
      difficulty: 1,
      gasLimit: BigNumber.from('0x01c9c364'),
      gasUsed: BigNumber.from('0xf6498d'),
      miner: '0x00',
      extraData: '0x00',
      transactions: ['0x00'],
      baseFeePerGas: BigNumber.from('0x23'),
      _difficulty: BigNumber.from('0x01')
    },
    event: {
      blockNumber: 10702263,
      blockHash: '0x00',
      transactionIndex: 28,
      removed: false,
      address: '0xfbcD6918907902c106A99058146CBdBb76a812f6',
      data: '0x00',
      topics: ['0x00'],
      transactionHash: '0x00',
      logIndex: 51,
      event: 'DripsUpdated',
      eventSignature:
        'DripsUpdated(address,uint256,uint128,(address,uint128)[])',
      args: {
        user: '0xec7E75F94297B479029b9213F8bBacBB60015C17',
        account: BigNumber.from('0x00'),
        balance: BigNumber.from(balance),
        receivers: [
          {
            receiver: '0x71E686C1B95e8A1faA636Ea046b97eA985E248d0',
            amtPerSec: BigNumber.from(amtPerSec)
          }
        ]
      }
    }
  } as DrippingEventWrapper);

const workstreamActive = (amtPerSec = eth(0.1), toppedUpAmount = eth(1)) => ({
  ...workstreamPendingSetup,
  workstream: mockWorkstreamData(
    WorkstreamState.ACTIVE,
    '7183eb29-f643-449d-99b5-ac710bf199bf'
  ),
  onChainData: {
    amtPerSec: mockMoney(amtPerSec),
    dripsEntries: [],
    streamSetUp: true,
    dripsUpdatedEvents: [mockDrippingEventWrapper(toppedUpAmount, amtPerSec)]
  }
});
const workstreamActiveOutput = (
  passedSeconds = 10,
  toppedUpAmount = eth(1),
  amtPerSec = eth(0.1)
) => ({
  workstream: workstreamActive(),
  remaining: mockMoney(
    bigIntMax(toppedUpAmount - BigInt(passedSeconds) * amtPerSec, BigInt(0))
  ),
  amount: mockMoney(
    bigIntMin(BigInt(passedSeconds) * amtPerSec, toppedUpAmount)
  )
});

const workstreamPaused = (
  amtPerSec = eth(0.1),
  toppedUpAmount = eth(1),
  pausedAfterSeconds = 5
) => ({
  ...workstreamPendingSetup,
  workstream: mockWorkstreamData(
    WorkstreamState.ACTIVE,
    '7183eb29-f643-449d-99b5-ac710bf199bf'
  ),
  onChainData: {
    amtPerSec: mockMoney(amtPerSec),
    dripsEntries: [],
    streamSetUp: true,
    dripsUpdatedEvents: [
      mockDrippingEventWrapper(toppedUpAmount, amtPerSec, 1000000000),
      mockDrippingEventWrapper(
        bigIntMax(
          toppedUpAmount - BigInt(pausedAfterSeconds) * amtPerSec,
          BigInt(0)
        ),
        BigInt(0),
        1000000000 + pausedAfterSeconds
      )
    ]
  }
});
const workstreamPausedOutput = (
  amtPerSec = eth(0.1),
  toppedUpAmount = eth(1),
  pausedAfterSeconds = 5
) => ({
  workstream: workstreamPaused(amtPerSec, toppedUpAmount, pausedAfterSeconds),
  remaining: mockMoney(
    bigIntMax(
      toppedUpAmount - BigInt(pausedAfterSeconds) * amtPerSec,
      BigInt(0)
    )
  ),
  amount: mockMoney(
    bigIntMin(BigInt(pausedAfterSeconds) * amtPerSec, toppedUpAmount)
  )
});

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
      streamedBetween([workstreamPendingSetup, workstreamPendingSetup])
    ).toEqual([workstreamPendingSetupOutput, workstreamPendingSetupOutput]);
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
