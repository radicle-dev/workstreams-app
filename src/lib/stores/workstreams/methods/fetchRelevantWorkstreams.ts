import { workstreamsStore } from '..';

export default async function (address: string, chainId: number) {
  return await Promise.all([
    await workstreamsStore.getWorkstreams({
      assignedTo: address,
      chainId: String(chainId)
    }),
    await workstreamsStore.getWorkstreams({
      createdBy: address,
      chainId: String(chainId)
    }),
    await workstreamsStore.getWorkstreams({
      applied: 'true',
      chainId: String(chainId)
    })
  ]);
}
