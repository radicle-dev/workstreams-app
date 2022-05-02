<script lang="ts">
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import { createIcon } from 'radicle-design-system/lib/blockies.ts';
  import { fade } from 'svelte/transition';

  import { onMount } from 'svelte';
  import { formatAddress } from '$lib/utils/format';
  import ensNames from '$lib/stores/ensNames';

  export let showAvatar = true;
  export let showAddress = true;
  export let address: string;
  export let style: string = undefined;

  let uriData: string;
  $: ensName = $ensNames[address]?.name;
  $: avatarUrl = $ensNames[address]?.pic;
  $: toDisplay = ensName ? ensName : formatAddress(address.toLocaleLowerCase());

  onMount(() => {
    uriData = blockyDataUri(address);

    ensNames.lookup(address);
  });

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
    {#if showAvatar}
      {#key avatarUrl}
        <img
          transition:fade={{ duration: 200 }}
          class="avatar"
          src={avatarUrl || uriData}
          alt="user-avatar"
        />
      {/key}
    {/if}
    {#if showAddress}
      {#key ensName}
        <p transition:fade={{ duration: 200 }} class="address typo-text-bold">
          {toDisplay}
        </p>
      {/key}
      <p class="placeholder typo-text-bold">
        {toDisplay}
      </p>
    {/if}
  </div>
{/if}

<style>
  .container {
    height: 1.5rem;
    position: relative;
    grid-template-columns: 1.5rem auto;
  }
  .avatar {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.75rem;
    user-select: none;
    left: 0;
    position: absolute;
    background-color: var(--color-foreground-level-5);
  }
  .address {
    position: absolute;
    left: 2rem;
    white-space: nowrap;
  }

  .placeholder {
    margin-left: 2rem;
    opacity: 0;
    white-space: nowrap;
    width: fit-content;
  }
</style>
