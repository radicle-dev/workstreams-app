import type { providers } from 'ethers';
import drips from '$lib/stores/drips';
import type { DripsUpdatedEvent } from '$lib/stores/drips/contracts/types/DaiDripsHub/DaiDripsHubAbi';

export interface DripsUpdatedEventWrapper {
  fromBlock: providers.Block;
  event: DripsUpdatedEvent;
}

export default async function (user: string, accountId: bigint) {
  const events = await drips.getDripsUpdatedEvents(user, accountId);

  const dripsUpdatedEventPromises: Promise<DripsUpdatedEventWrapper>[] =
    events.map(
      (e) =>
        new Promise((resolve) => {
          e.getBlock().then((block) => resolve({ fromBlock: block, event: e }));
        })
    );

  return Promise.all(dripsUpdatedEventPromises);
}
