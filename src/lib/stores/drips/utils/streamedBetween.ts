import type { EnrichedWorkstream } from '$lib/stores/workstreams';
import { Currency, type Money } from '$lib/stores/workstreams/types';

interface TimeWindow {
  from: Date;
  to: Date;
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
    const events = stream.onChainData.dripsUpdatedEvents;

    let amountStreamed = BigInt(0);
    let amountRemaining = BigInt(0);

    events.forEach((dew, index) => {
      const nextDew = events[index + 1];
      const validSince = dew.fromBlock.timestamp;
      const validUntil =
        nextDew?.fromBlock.timestamp || new Date().getTime() / 1000;
      const amtPerSec =
        dew.event.args.receivers[0]?.amtPerSec.toBigInt() || BigInt(0);
      const balance = dew.event.args.balance.toBigInt();

      if (amtPerSec === BigInt(0)) return;

      const toppedUpUntil = validSince + Number(balance / amtPerSec);

      const relevantWindow = {
        from: Math.max(validSince, timeWindow.from.getTime() / 1000),
        to: Math.min(timeWindow.to.getTime() / 1000, validUntil, toppedUpUntil)
      };

      const secondsInWindow = Math.floor(
        Math.max(relevantWindow.to - relevantWindow.from, 0)
      );

      const streamedDuringCurrentEvent = BigInt(secondsInWindow) * amtPerSec;
      amountStreamed = amountStreamed + streamedDuringCurrentEvent;

      if (index === events.length - 1) {
        amountRemaining = balance - streamedDuringCurrentEvent;
      }
    });

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
