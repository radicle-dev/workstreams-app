<script lang="ts">
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import { createIcon } from 'radicle-design-system/lib/blockies.ts';
  import { fade } from 'svelte/transition';

  import { onMount } from 'svelte';
  import { formatAddress } from '$lib/utils/format';
  import ensNames from '$lib/stores/ensNames';
  import { walletStore } from '$lib/stores/wallet/wallet';

  export let address: string;
  export let style: string = undefined;

  let uriData: string;
  $: ensName = $ensNames[address]?.name;
  $: avatarUrl = $ensNames[address]?.pic;
  $: toDisplay = ensName ? ensName : formatAddress(address.toLocaleLowerCase());

  onMount(() => {
    uriData = blockyDataUri(address);

    lookup();
  });

  function lookup() {
    ensNames.lookup(address, $walletStore.provider);
  }

  const blockyDataUri = (urn: string) => {
    return createIcon({
      seed: urn.toLowerCase(),
      size: 8,
      scale: 16
    }).toDataURL();
  };
</script>

{#if address}
  <div class="container" {style}>
    {#key avatarUrl}
      <img
        transition:fade={{ duration: 200 }}
        class="avatar"
        src={avatarUrl || uriData}
        alt="user-avatar"
      />
    {/key}
    <div class="avatar-placeholder" />
    {#key ensName}
      <h2 transition:fade={{ duration: 200 }} class="address">
        {toDisplay}
      </h2>
    {/key}
    <!--
        Placeholder without absolute position to ensure that the component
        has the right width.
      -->
    <h2 class="address-placeholder">
      {toDisplay}
    </h2>
  </div>
{/if}

<style>
  .container {
    height: 3rem;
    display: flex;
    gap: 1rem;
    position: relative;
    grid-template-columns: 3rem auto;
    align-items: center;
  }
  .avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    user-select: none;
    top: 0;
    left: 0;
    position: absolute;
    background-color: var(--color-foreground-level-5);
  }

  .avatar-placeholder {
    width: 3rem;
    height: 3rem;
    opacity: 0;
  }
  .address {
    position: absolute;
    left: 4rem;
    white-space: nowrap;
  }

  .address-placeholder {
    opacity: 0;
    white-space: nowrap;
    width: fit-content;
  }
</style>
