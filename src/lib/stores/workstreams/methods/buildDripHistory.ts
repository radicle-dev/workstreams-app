import type { DrippingEventWrapper } from '..';
import type { DripHistoryEvent } from '../ipfs';

export default function buildDripHistory(
  updateEvents: DrippingEventWrapper[],
  receiver: string
) {
  return updateEvents.reduce<DripHistoryEvent[]>((acc, dew) => {
    const { args } = dew.event;
    const recipient = args.receivers.find(
      (r) => r.receiver.toLowerCase() === receiver
    );

    return [
      ...acc,
      {
        balance: {
          currency: 'dai',
          wei: args.balance.toBigInt()
        },
        amtPerSec: {
          currency: 'dai',
          wei: recipient?.amtPerSec.toBigInt() || BigInt(0)
        },
        timestamp: new Date(dew.fromBlock.timestamp * 1000)
      }
    ];
  }, []);
}
