<script lang="ts">
  import { fade } from 'svelte/transition';

  import { prefetch } from '$app/navigation';
  import { onMount } from 'svelte';
  import { formatAddress } from '$lib/utils/format';
  import ensNames from '$lib/stores/ensNames';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import Avatar from './Avatar.svelte';
  import convertRemToPixels from '$lib/utils/remToPx';

  export let showAvatar = true;
  export let avatarRem = 1.5;
  export let noLink = false;
  export let showAddress = true;
  export let address: string | undefined;
  export let style: string | undefined = undefined;
  let hover = false;

  let firstRender = true;

  $: ensName = address && $ensNames[address]?.name;
  $: avatarUrl = address && $ensNames[address]?.pic;
  $: toDisplay =
    address && (ensName ? ensName : formatAddress(address.toLowerCase()));

  $: {
    if (address) lookup(address);
  }

  function lookup(add: string) {
    ensNames.lookup(add, $walletStore.provider);
  }

  onMount(() => (firstRender = false));

  $: url = `/profile/${address}`;
</script>

{#if address}
  <a
    class="container"
    style:height={`${convertRemToPixels(avatarRem)}px`}
    {style}
    href={noLink ? undefined : url}
    on:mouseenter={() => {
      prefetch(url);
      hover = true;
    }}
    on:mouseleave={() => (hover = false)}
  >
    {#if showAvatar}
      {#key avatarUrl}
        <div
          in:fade={{ duration: firstRender ? 0 : 200 }}
          class="avatar-container"
        >
          <Avatar {address} rem={avatarRem} />
        </div>
      {/key}
      <div class="avatar-placeholder">
        <Avatar {address} rem={avatarRem} />
      </div>
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
    display: flex;
    gap: 0.5rem;
    position: relative;
    grid-template-columns: 1.5rem auto;
    cursor: pointer;
  }

  .avatar-container {
    position: absolute;
  }

  .avatar-placeholder {
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
