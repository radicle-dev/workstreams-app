<script lang="ts">
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import { toWei } from 'drips-sdk';
  import { utils } from 'ethers';

  import {
    workstreamsStore,
    type EnrichedWorkstream
  } from '$lib/stores/workstreams';
  import { createEventDispatcher, onMount } from 'svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import drips from '$lib/stores/drips';
  import Card from '../Card.svelte';
  import TitleMeta from '../TitleMeta.svelte';
  import TimeRate from '../TimeRate.svelte';
  import { currencyFormat } from '$lib/utils/format';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import tick from '$lib/stores/tick';
  import type { AwaitPendingPayload } from '../StepperModal/types';
  import { walletStore } from '$lib/stores/wallet/wallet';

  const dispatch = createEventDispatcher<{
    awaitPending: AwaitPendingPayload;
  }>();

  const estimates = workstreamsStore.estimates;

  export let enrichedWorkstream: EnrichedWorkstream;

  let topUpAmount = 1;
  $: topUpAmountWei = toWei(topUpAmount || 0).toBigInt();

  $: estimate = $estimates.workstreams[enrichedWorkstream.data.id];
  $: streamingUntil = estimate?.streamingUntil;
  $: currAmtPerSec = enrichedWorkstream.onChainData.amtPerSec.wei;
  $: remainingBalance = estimate?.remainingBalance;

  let streamingUntilAfterTopup: Date | undefined = undefined;

  const formatDate = (date: Date) =>
    Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: 'numeric',
      second: '2-digit'
    }).format(date);

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
    const interval = tick.register(updateStreamingUntilAfterTopup);

    return () => {
      tick.deregister(interval);
    };
  });

  let daiBalance: bigint;
  onMount(async () => {
    daiBalance = (await drips.getDaiBalance()).toBigInt();
  });

  $: topUpExceedsBalance =
    daiBalance < utils.parseUnits((topUpAmount || 0).toString()).toBigInt();

  $: buttonDisabled = txInFlight || !topUpAmount || topUpExceedsBalance;

  let txInFlight = false;

  async function topUp() {
    txInFlight = true;

    try {
      const isSafe = $walletStore.safe?.ready;

      const waitFor = async () => {
        if (isSafe) {
          drips.topUp(enrichedWorkstream, topUpAmountWei);
        } else {
          const tx = await drips.topUp(enrichedWorkstream, topUpAmountWei);
          await tx.wait(1);
          await workstreamsStore.getWorkstream(
            enrichedWorkstream.data.id,
            undefined,
            true
          );
        }
      };

      dispatch('awaitPending', { promise: waitFor });
    } catch {
      txInFlight = false;
    }
  }
</script>

<div>
  <Emoji emoji="💰" size="large" />
  <h1>Top up</h1>
  <div class="content">
    <div class="input-with-label">
      <h4>Topping up</h4>
      <Card style="width: 100%">
        <div slot="top">
          <TitleMeta workstream={enrichedWorkstream.data} />
        </div>
        <div slot="bottom">
          <TimeRate workstream={enrichedWorkstream.data} />
        </div>
      </Card>
    </div>
    <div class="row">
      <div class="input-with-label narrow">
        <h4>Remaining balance</h4>
        <p class="value">{currencyFormat(remainingBalance)} DAI</p>
      </div>
      <div class="input-with-label">
        {#if remainingBalance.wei > BigInt(0)}
          <h4>Streaming until</h4>
        {:else}
          <h4>Ran out of funds on</h4>
        {/if}
        <p class="value">{formatDate(streamingUntil)}</p>
      </div>
    </div>
    <div class="row">
      <div class="input-with-label amount-input narrow">
        <h4>Top up amount</h4>
        <TextInput
          variant={{ type: 'number', min: 0 }}
          bind:value={topUpAmount}
          suffix="DAI"
          validationState={topUpExceedsBalance
            ? {
                type: 'invalid',
                message: `You only have ${currencyFormat(daiBalance)} DAI`
              }
            : { type: 'valid' }}
        />
      </div>
      {#if !$walletStore.safe?.ready}
        <div class="input-with-label">
          <h4>After topup, runs until</h4>
          {#if topUpAmount > 0}
            <p class="value">{formatDate(streamingUntilAfterTopup)}</p>
          {:else}
            <p class="value">—</p>
          {/if}
        </div>
      {/if}
    </div>
    {#if $walletStore.safe?.ready}
      <p class="typo-text-small">
        Please note that funds will only start streaming once the top-up
        transaction has been executed by your connected Gnosis Safe.
      </p>
    {/if}
    <div class="actions">
      <Button disabled={buttonDisabled} on:click={topUp}
        >Top up {topUpAmount} DAI</Button
      >
    </div>
  </div>
</div>

<style>
  h1 {
    margin: 1rem 0;
  }

  h4 {
    color: var(--color-foreground-level-5);
  }

  .content {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 2rem;
    text-align: left;
  }

  p {
    text-align: left;
  }

  .input-with-label {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
    width: 100%;
  }

  .narrow {
    flex: 0.6;
  }

  .value {
    font-size: 1.5rem;
    line-height: 2.5rem;
    text-align: left;
    color: var(--color-foreground-level-6);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  .row {
    display: flex;
    gap: 2rem;
    width: 100%;
  }

  @media only screen and (max-width: 54rem) {
    .row {
      flex-direction: column;
    }
  }
</style>
