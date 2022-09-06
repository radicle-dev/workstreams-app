import { ethers } from 'ethers';
import { get, writable } from 'svelte/store';

const defaultProvider = ethers.getDefaultProvider();

export default (() => {
  const store = writable<{
    [address: string]: { name?: string; pic?: string };
  }>({});

  async function lookup(
    address: string,
    provider?: ethers.providers.BaseProvider
  ) {
    const saved = get(store)[address];

    if (!saved) {
      /*
        Write an empty object initially in order to prevent
        multiple in-flight requests for the same address.
      */
      store.update((v) => ({ ...v, [address]: {} }));

      const name =
        (await (provider || defaultProvider).lookupAddress(address)) ||
        undefined;

      /*
        Updating with only the name already since the avatar
        tends to be slow.
      */
      store.update((v) => ({ ...v, [address]: { name } }));

      let pic: string | undefined;

      if (name) {
        pic = (
          await (
            await (provider || defaultProvider).getResolver(name)
          )?.getAvatar()
        )?.url;
      }

      store.update((v) => ({ ...v, [address]: { name, pic } }));
    }

    return get(store)[address];
  }

  async function reverse(
    name: string,
    provider?: ethers.providers.BaseProvider
  ): Promise<string | undefined> {
    const address = await (provider || defaultProvider).resolveName(name);

    return address || undefined;
  }

  return {
    subscribe: store.subscribe,
    lookup,
    reverse
  };
})();
