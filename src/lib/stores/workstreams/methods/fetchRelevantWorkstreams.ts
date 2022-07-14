import { workstreamsStore } from '..';

export default async function (address: string) {
  console.log('fetching');
  return await Promise.all([
    await workstreamsStore.getWorkstreams({
      assignedTo: address
    }),
    await workstreamsStore.getWorkstreams({
      createdBy: address
    }),
    await workstreamsStore.getWorkstreams({ applied: 'true' })
  ]);
}
