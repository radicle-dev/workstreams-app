<script lang="ts">
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import { toWei } from 'drips-sdk';

  import * as modal from '$lib/utils/modal';
  import {
    workstreamsStore,
    type EnrichedWorkstream
  } from '$lib/stores/workstreams';
  import TextInput from './TextInput.svelte';
  import Modal from './Modal.svelte';
  import { onMount } from 'svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import drips from '$lib/stores/drips';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  const estimates = workstreamsStore.estimates;

  export let enrichedWorkstream: EnrichedWorkstream;

  let topUpAmount = 0;
  $: topUpAmountWei = toWei(topUpAmount || 0).toBigInt();

  $: streamingUntil =
    $estimates.streams[enrichedWorkstream.data.id]?.streamingUntil;
  $: currAmtPerSec = enrichedWorkstream.onChainData.amtPerSec.wei;

  let streamingUntilAfterTopup: Date | undefined = undefined;

  function updateStreamingUntilAfterTopup() {
    /*
      Top up starts streaming either now (if it's currently out of funds) or after
      the remaining balance runs out
    */
    const topUpStartsStreamingAt = Math.max(
      streamingUntil.getTime(),
      new Date().getTime()
    );

    streamingUntilAfterTopup = new Date(
      topUpStartsStreamingAt + Number(topUpAmountWei / currAmtPerSec) * 1000
    );
  }

  // Update `streamingUntilAfterTopup` if the user changes the top up amount
  $: {
    topUpAmount;
    updateStreamingUntilAfterTopup();
  }

  // Also update `streamingUntilAfterTopup` each second
  onMount(() => {
    const interval = setInterval(updateStreamingUntilAfterTopup, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  let txInFlight = false;
  $: buttonDisabled = txInFlight || !topUpAmount;

  async function topUp() {
    txInFlight = true;

    try {
      const tx = await drips.topUp(enrichedWorkstream, topUpAmountWei);
      await tx.wait(1);
      await workstreamsStore.getWorkstream(
        enrichedWorkstream.data.id,
        undefined,
        true
      );
      modal.hide();
    } finally {
      txInFlight = false;
    }
  }
</script>

<Modal>
  <div slot="body">
    <Emoji emoji="💰" size="large" />
    <h1>Top up</h1>
    <div class="content">
      <p>Workstream is streaming until: {streamingUntil}</p>
      {#if streamingUntil.getTime() < new Date().getTime()}
        The workstream is currently out of funds and not streaming anymore!
      {/if}
      <div class="input-with-label">
        <p>Top up amount:</p>
        <TextInput number bind:value={topUpAmount} />
      </div>
      <p>
        After topping up {topUpAmount || 0} DAI, the workstream will run until approximately:
        {streamingUntilAfterTopup}
      </p>
      <Button disabled={buttonDisabled} on:click={topUp}
        >Top up {topUpAmount} DAI</Button
      >
    </div>
  </div>
</Modal>

<style>
  h1 {
    margin: 1rem 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-with-label {
    display: flex;
    gap: 8px;
  }
</style>
