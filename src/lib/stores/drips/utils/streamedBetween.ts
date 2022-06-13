import type { EnrichedWorkstream } from '$lib/stores/workstreams';
import { Currency, type Money } from '$lib/stores/workstreams/types';

/**
 * Calculates the exact amounts earned and spent within a given time window and
 * list of workstreams to consider.
 */
export default function streamedBetween(
  timeWindow: { from: Date; to: Date },
  streams: EnrichedWorkstream[]
) {
  const amountsStreamed: { workstream: EnrichedWorkstream; amount: Money }[] =
    [];

  for (const stream of streams) {
    const events = stream.onChainData.dripsUpdatedEvents;

    let amountStreamed = BigInt(0);

    events.forEach((dew, index) => {
      const nextDew = events[index + 1];
      const validSince = dew.fromBlock.timestamp;
      const validUntil =
        nextDew?.fromBlock.timestamp || new Date().getTime() / 1000;
      const amtPerSec =
        dew.event.args.receivers[0]?.amtPerSec.toBigInt() || BigInt(0);

      if (amtPerSec === BigInt(0)) return;

      const toppedUpUntil =
        validSince + Number(dew.event.args.balance.toBigInt() / amtPerSec);

      const relevantWindow = {
        from: Math.max(validSince, timeWindow.from.getTime() / 1000),
        to: Math.min(timeWindow.to.getTime() / 1000, validUntil, toppedUpUntil)
      };

      const secondsInWindow = Math.floor(
        Math.max(relevantWindow.to - relevantWindow.from, 0)
      );
      amountStreamed = amountStreamed + BigInt(secondsInWindow) * amtPerSec;
    });

    if (amountStreamed) {
      amountsStreamed.push({
        workstream: stream,
        amount: {
          currency: Currency.DAI,
          wei: amountStreamed
        }
      });
    }
  }

  return {
    earned: amountsStreamed.filter(
      (a) => a.workstream.direction === 'incoming'
    ),
    spent: amountsStreamed.filter((a) => a.workstream.direction === 'outgoing')
  };
}
