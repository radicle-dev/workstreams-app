import type {
  DripHistoryEvent,
  EnrichedWorkstream
} from '$lib/stores/workstreams';
import { Currency, type Money } from '$lib/stores/workstreams/types';
import { getUnixTime } from '$lib/utils/time';

interface TimeWindow {
  from: Date;
  to: Date;
}

/**
 * Returns the amount of money earned and spent between the given time window
 * based on a given history of DripHistoryEvents.
 */
export function flattenDripHistory(
  history: DripHistoryEvent[],
  timeWindow: TimeWindow = { from: new Date(0), to: new Date() }
) {
  let amountStreamed = BigInt(0);
  let amountRemaining = BigInt(0);

  const filteredHistory = history.filter((e) => e.timestamp < timeWindow.to);

  filteredHistory.forEach((e, index) => {
    const nextEvent = filteredHistory[index + 1];
    const validUntil = nextEvent?.timestamp || new Date();
    const { balance, amtPerSec, timestamp: validSince } = e;
    const validSinceSeconds = getUnixTime(validSince);
    const validUntilSeconds = getUnixTime(validUntil);

    // Stream is currently paused.
    if (!nextEvent && amtPerSec.wei === BigInt(0)) {
      amountRemaining = balance.wei;
    }

    if (amtPerSec.wei === BigInt(0)) return;

    const toppedUpUntil =
      validSinceSeconds + Number(balance.wei / amtPerSec.wei);

    const relevantWindow = {
      from: Math.max(validSinceSeconds, getUnixTime(timeWindow.from)),
      to: Math.min(getUnixTime(timeWindow.to), validUntilSeconds, toppedUpUntil)
    };

    const secondsInWindow = Math.floor(
      Math.max(relevantWindow.to - relevantWindow.from, 0)
    );

    const streamedDuringCurrentEvent = BigInt(secondsInWindow) * amtPerSec.wei;
    amountStreamed = amountStreamed + streamedDuringCurrentEvent;

    if (!nextEvent) {
      amountRemaining = balance.wei - streamedDuringCurrentEvent;
    }
  });

  return {
    amountStreamed,
    amountRemaining
  };
}

/**
 * Calculates the exact amounts streamed and remaining for streams related
 * to a given array of EnrichedWorkstream objects.
 */
export function streamedBetween(
  streams: EnrichedWorkstream[],
  timeWindow: TimeWindow = { from: new Date(0), to: new Date() }
) {
  const amountsStreamed: {
    workstream: EnrichedWorkstream;
    amount: Money;
    remaining: Money;
  }[] = [];

  for (const stream of streams) {
    const { dripHistory } = stream.onChainData || {};

    const { amountStreamed, amountRemaining } = (dripHistory &&
      flattenDripHistory(dripHistory, timeWindow)) || {
      amountStreamed: BigInt(0),
      amountRemaining: BigInt(0)
    };

    amountsStreamed.push({
      workstream: stream,
      amount: {
        currency: Currency.DAI,
        wei: amountStreamed
      },
      remaining: {
        currency: Currency.DAI,
        wei: amountRemaining
      }
    });
  }

  return amountsStreamed;
}

/**
 * Breaks down the amounts earned and spent by the currently logged-in
 * user for a given array of EnrichedWorkstream objects.
 */
export function amountsEarnedAndSpentBetween(
  streams: EnrichedWorkstream[],
  timeWindow: TimeWindow = { from: new Date(0), to: new Date() }
) {
  const amounts = streamedBetween(streams, timeWindow);

  return {
    earned: amounts.filter(
      (a) => a.workstream.direction === 'incoming' && a.amount.wei > 0
    ),
    spent: amounts.filter(
      (a) => a.workstream.direction === 'outgoing' && a.amount.wei > 0
    )
  };
}
