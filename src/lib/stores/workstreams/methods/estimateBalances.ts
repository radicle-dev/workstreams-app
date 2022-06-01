import type { EnrichedWorkstream, Estimate } from '..';
import { Currency } from '../types';

export default function (
  workstreams: { [wsId: string]: EnrichedWorkstream },
  since?: Date
) {
  const newEstimates: { [wsId: string]: Estimate } = {};

  for (const [wsId, v] of Object.entries(workstreams)) {
    if (!v.onChainData) continue;

    const { dripsUpdatedEvents } = v.onChainData;

    if (dripsUpdatedEvents.length === 0) {
      throw new Error(`Drips not set up for active workstream ${wsId}`);
    }

    let earned = BigInt(0);
    let remainingBalance = BigInt(0);

    /*
      Iterate over all `dripsUpdated` events associated with the
      particular drips subaccount linked to the workstream.
    */
    dripsUpdatedEvents.forEach((dew, i) => {
      const nextDew = dripsUpdatedEvents[i + 1];

      const toppedUpAmount = dew.event.args.balance.toBigInt();
      const amtPerSec = dew.event.args.receivers[0].amtPerSec.toBigInt();
      const updateTimestamp = new Date(dew.fromBlock.timestamp * 1000);
      const nextUpdateTimestamp = nextDew
        ? new Date(nextDew.fromBlock.timestamp * 1000).getTime()
        : new Date().getTime();

      const toppedUpForSecs = toppedUpAmount / amtPerSec;
      const drippingUntil = Math.min(
        updateTimestamp.getTime() / 1000 + Number(toppedUpForSecs),
        nextUpdateTimestamp
      );
      const secsDripping = Math.max(
        drippingUntil - (since || updateTimestamp).getTime() / 1000,
        0
      );

      const earnedDuringUpdate = BigInt(Math.floor(secsDripping)) * amtPerSec;

      earned += earnedDuringUpdate;

      if (!nextDew) {
        remainingBalance = toppedUpAmount - earnedDuringUpdate;
      }
    });

    newEstimates[wsId] = {
      currentBalance: {
        wei: earned,
        currency: Currency.DAI
      },
      remainingBalance: {
        wei: remainingBalance,
        currency: Currency.DAI
      }
    };
  }

  return newEstimates;
}
