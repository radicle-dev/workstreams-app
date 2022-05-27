import drips from '$lib/stores/drips';

export default async function () {
  const cycleSecs = await drips.getCycleSecs();

  const currentCycleSecs =
    BigInt(Math.floor(Date.now() / 1000)) % cycleSecs.toBigInt();

  return new Date(new Date().getTime() - Number(currentCycleSecs) * 1000);
}
