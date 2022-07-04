<script lang="ts">
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import { createIcon } from 'radicle-design-system/lib/blockies.ts';
  import { fade } from 'svelte/transition';

  import { prefetch } from '$app/navigation';
  import { onMount } from 'svelte';
  import { formatAddress } from '$lib/utils/format';
  import ensNames from '$lib/stores/ensNames';
  import { walletStore } from '$lib/stores/wallet/wallet';

  export let showAvatar = true;
  export let showAddress = true;
  export let address: string;
  export let style: string = undefined;
  let hover = false;

  let firstRender = true;

  let uriData: string;
  $: ensName = $ensNames[address]?.name;
  $: avatarUrl = $ensNames[address]?.pic;
  $: toDisplay = ensName ? ensName : formatAddress(address.toLowerCase());
  $: uriData = blockyDataUri(address);

  onMount(() => {
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

  onMount(() => (firstRender = false));

  $: url = `/profile/${address}`;
</script>

{#if address}
  <a
    class="container"
    {style}
    href={url}
    on:mouseenter={() => {
      prefetch(url);
      hover = true;
    }}
    on:mouseleave={() => (hover = false)}
  >
    {#if showAvatar}
      {#key avatarUrl}
        <img
          in:fade={{ duration: firstRender ? 0 : 200 }}
          class="avatar"
          src={avatarUrl || uriData}
          alt="user-avatar"
        />
      {/key}
      <div class="avatar-placeholder" />
    {/if}
    {#if showAddress}
      {#key ensName}
        <p
          in:fade={{ duration: firstRender ? 0 : 200 }}
          class="address typo-text-bold"
          class:hover
        >
          {toDisplay}
        </p>
      {/key}
      <!--
        Placeholder without absolute position to ensure that the component
        has the right width.
      -->
      <p class="address-placeholder typo-text-bold">
        {toDisplay}
      </p>
    {/if}
  </a>
{/if}

<style>
  .container {
    height: 1.5rem;
    display: flex;
    gap: 0.5rem;
    position: relative;
    grid-template-columns: 1.5rem auto;
    cursor: pointer;
  }
  .avatar {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.75rem;
    user-select: none;
    top: 0;
    left: 0;
    position: absolute;
    background-color: var(--color-foreground-level-5);
  }

  .avatar-placeholder {
    width: 1.5rem;
    height: 1.5rem;
    opacity: 0;
  }

  .address {
    position: absolute;
    left: 2rem;
    color: var(--color-foreground-level-6);
    white-space: nowrap;
  }

  .address.hover {
    text-decoration: underline;
  }

  .address-placeholder {
    opacity: 0;
    white-space: nowrap;
    width: fit-content;
  }
</style>
