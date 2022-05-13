<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import User from '$components/User.svelte';
  import Card from '$components/Card.svelte';
  import drips from '$lib/stores/drips';
  import TextInput from '$components/TextInput.svelte';
  import {
    Currency,
    type Application,
    type Money,
    type Workstream
  } from '$lib/stores/workstreams/types';
  import { currencyFormat, weiToDai } from '$lib/utils/format';
  import ButtonRow from '../components/ButtonRow.svelte';
  import { workstreamsStore } from '$lib/stores/workstreams/workstreams';
  import { parseUnits } from 'ethers/lib/utils';

  const dispatch = createEventDispatcher();

  export let application: Application;
  export let workstream: Workstream;

  let actionInFlight = false;
  let daiBalance: bigint | undefined;

  let topUpAmount = 0;
  let totalAmount: number = weiToDai(workstream.total);

  $: topUpExceedsBalance = daiBalance < BigInt(topUpAmount);

  $: weiPerDay =
    parseUnits(totalAmount.toString()).toBigInt() /
    BigInt(workstream.durationDays);
  $: daiPerDay = currencyFormat(weiPerDay);

  onMount(async () => {
    daiBalance = (await drips.getDaiBalance()).toBigInt();

    topUpAmount =
      daiBalance < workstream.total.wei
        ? weiToDai(daiBalance)
        : weiToDai(workstream.total.wei);
  });

  async function setUpPayment() {
    actionInFlight = true;

    try {
      const createDripCall = await drips.createDrip(
        application.creator,
        {
          currency: Currency.DAI,
          wei: weiPerDay / BigInt(86400)
        },
        parseUnits(topUpAmount.toString()).toBigInt()
      );

      const receipt = await createDripCall.tx.wait(1);

      if (receipt.status === 0) {
        console.error(receipt);
        return;
      }

      const activateCall = await workstreamsStore.activateWorkstream(
        workstream.id,
        createDripCall.accountId
      );

      if (activateCall.ok) {
        dispatch('continue');
      } else {
        console.error(activateCall.error);
      }
    } catch (e) {
      console.error(e);
      actionInFlight = false;
    }
  }
</script>

<div>
  <span class="emoji">💸</span>
  <h1>Set up payment stream</h1>
  <p>Here's the drips config we're gonna set up.</p>
  <form>
    <div class="input-with-label">
      <h4>Streaming to</h4>
      <Card hoverable={false} style="width: 100%">
        <div slot="top">
          <User address={application.creator} />
        </div>
      </Card>
    </div>
    <div class="inner">
      <div class="input-with-label">
        <h4>Total amount</h4>
        <!-- TODO: wired up to update the stream rate + that's what you're submitting -->
        <TextInput
          bind:value={totalAmount}
          suffix="DAI"
          style="width: fit-content;"
          number
        />
      </div>
      <div class="input-with-label rate">
        <h4 style="color: var(--color-foreground-level-4);">Stream rate</h4>
        <p>
          {daiPerDay} DAI / 24h
        </p>
      </div>
    </div>
    <div class="inner">
      <div class="input-with-label">
        <h4>Top up amount</h4>
        <TextInput
          bind:value={topUpAmount}
          suffix="DAI"
          number
          style="width: fit-content;"
          validationState={topUpExceedsBalance
            ? {
                type: 'invalid',
                message: `You only have ${currencyFormat(daiBalance)} DAI`
              }
            : { type: 'valid' }}
        />
      </div>
    </div>
  </form>
  <ButtonRow
    disabled={actionInFlight || topUpExceedsBalance}
    buttonText="Set up drip & top up"
    on:continue={setUpPayment}
  />
</div>

<style>
  h1 {
    margin: 1rem 0 2rem;
    color: var(--color-foreground);
  }

  .emoji {
    font-size: 2rem;
  }

  form > * {
    margin-bottom: 32px;
  }

  .input-with-label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .inner {
    display: flex;
    gap: 1.5rem;
  }

  .rate > p {
    display: flex;
    height: 2.5rem;
    align-items: center;
    color: var(--color-foreground-level-4);
  }
</style>
