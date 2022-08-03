<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import Spinner from 'radicle-design-system/Spinner.svelte';
  import Dropdown from 'radicle-design-system/Dropdown.svelte';
  import { get } from 'svelte/store';

  import * as modal from '$lib/utils/modal';
  import type { AwaitPendingPayload } from '$lib/components/StepperModal/types';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import { getSafesForAddress } from '$lib/api/gnosis';
  import clearStores from '$lib/stores/utils/clearStores';
  import connectStores from '$lib/stores/utils/connectStores';
  import StepContent from '$lib/components/StepContent.svelte';
  import { formatAddress } from '$lib/utils/format';
  import User from '$lib/components/User.svelte';

  const dispatch = createEventDispatcher<{
    continue: never;
    awaitPending: AwaitPendingPayload;
  }>();

  let safeAddresses: string[] | undefined = undefined;
  let selectedSafeAddress: string;

  onMount(async () => {
    const ownedSafes = await getSafesForAddress(
      $walletStore.network.chainId,
      $walletStore.address
    );

    if (!ownedSafes || ownedSafes.length === 0) {
      modal.hide();
    }

    safeAddresses = ownedSafes;
    selectedSafeAddress = safeAddresses[0];
  });

  function linkSafe(address: string) {
    const waitFor = async () => {
      await walletStore.linkSafe(address);
      await walletStore.connectSafe();

      const ws = get(walletStore);

      if (!ws.safe?.provider) {
        throw 'Expected a safe provider after connecting safe';
      }

      clearStores();
      await connectStores(ws.safe.provider);
    };
    dispatch('awaitPending', {
      promise: waitFor,
      message: 'Please connect via WalletConnect...'
    });
  }
</script>

{#if safeAddresses}
  <StepContent>
    <span slot="headline">Link your Gnosis Safe</span>
    <div slot="content">
      {#if safeAddresses.length > 1}
        <div class="safe-selector">
          <Dropdown
            bind:value={selectedSafeAddress}
            options={safeAddresses.map((a) => ({
              title: formatAddress(a),
              value: a
            }))}
          />
        </div>
      {:else}
        <div class="safe"><User address={selectedSafeAddress} /></div>
      {/if}
      <p>
        We detected a Gnosis Safe associated with your account. If you link it,
        you'll be interacting with Workstreams on behalf of your safe, and all
        transactions will require a quorum.
      </p>
      <p>
        To connect, open the <span class="typo-text-bold"
          >WalletConnect Safe App</span
        >
        within your Gnosis Safe by navigating to
        <span class="typo-text-bold">Apps</span>
        →
        <span class="typo-text-bold">WalletConnect</span>. Then, press
        <span class="typo-text-bold">Connect safe</span>
        below, copy the connection URL to your clipboard, and paste it into the connection
        link field in the WalletConnect Safe App.
      </p>
      <p class="typo-text-small">
        If you skip this, you'll be using Workstreams with your
        previously-connected wallet.
      </p>
    </div>
    <div slot="step-actions">
      <Button variant="outline" on:click={() => modal.hide()}>Don't link</Button
      >
      <Button on:click={() => linkSafe(selectedSafeAddress)}>Link safe</Button>
    </div>
  </StepContent>
{:else}
  <Spinner />
{/if}

<style>
  p {
    margin-bottom: 1rem;
  }

  .safe {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
  }

  .safe-selector {
    max-width: 10rem;
    margin: 0 auto;
    margin-bottom: 1.5rem;
  }
</style>
