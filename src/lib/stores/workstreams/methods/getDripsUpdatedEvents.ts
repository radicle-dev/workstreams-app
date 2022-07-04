import drips from '$lib/stores/drips';
import type { DrippingEventWrapper } from '..';

export default async function (user: string, accountId: bigint) {
  const events = await drips.getDripsUpdatedEvents(user, accountId);

  const drippingEventsPromises: Promise<DrippingEventWrapper>[] = events.map(
    (e) =>
      new Promise((resolve) => {
        e.getBlock().then((block) => resolve({ fromBlock: block, event: e }));
      })
  );

  return Promise.all(drippingEventsPromises);
}
