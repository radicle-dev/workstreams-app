<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import User from '$components/User.svelte';
  import Card from '$components/Card.svelte';
  import drips from '$lib/stores/drips';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import { Currency, type Workstream } from '$lib/stores/workstreams/types';
  import { currencyFormat, weiToDai } from '$lib/utils/format';
  import ButtonRow from '../../components/ButtonRow.svelte';
  import { utils } from 'ethers';

  const dispatch = createEventDispatcher();

  export let workstream: Workstream;

  let actionInFlight = false;
  let daiBalance: bigint | undefined;

  let topUpAmount = 0;
  let totalAmount: number = weiToDai(workstream.total);

  $: topUpExceedsBalance =
    (daiBalance ?? BigInt(0)) <
    utils.parseUnits(topUpAmount.toString()).toBigInt();

  $: weiPerDay =
    utils.parseUnits(totalAmount.toString()).toBigInt() /
    BigInt(workstream.durationDays);
  $: daiPerDay = currencyFormat(weiPerDay);
  $: totalWei = weiPerDay * BigInt(workstream.durationDays);

  onMount(async () => {
    daiBalance = (await drips.getDaiBalance()).toBigInt();

    topUpAmount =
      daiBalance < totalWei
        ? weiToDai(daiBalance)
        : weiToDai(workstream.total.wei);
  });

  async function setUpPayment() {
    actionInFlight = true;

    try {
      const accountId = workstream.dripsData?.accountId;

      if (!accountId) {
        throw new Error('Unable to find Drips account ID for workstream.');
      }

      const { acceptedApplication } = workstream;
      if (!acceptedApplication) {
        throw new Error(
          'An accepted application is required to set up payment'
        );
      }

      const waitFor = async () => {
        drips.createDrip(
          acceptedApplication,
          {
            currency: Currency.DAI,
            wei: weiPerDay / BigInt(86400)
          },
          accountId,
          utils.parseUnits(topUpAmount.toString()).toBigInt()
        );
      };

      dispatch('awaitPending', {
        promise: waitFor,
        message: 'Activating your workstream...'
      });
    } catch {
      actionInFlight = false;
      return;
    }
  }
</script>

<div>
  <Emoji emoji="💸" size="large" />
  <h1>Set up payment stream</h1>
  <p>
    Customize your stream below. When you confirm, the Workstream will be
    activated, but it will only start streaming funds once the setup transaction
    has been executed by your connected Gnosis Safe.
  </p>
  <form>
    <div class="input-with-label">
      <h4>Streaming to</h4>
      <Card hoverable={false} style="width: 100%">
        <div slot="top">
          <User address={workstream.acceptedApplication} />
        </div>
      </Card>
    </div>
    <div class="inner">
      <div class="input-with-label">
        <h4>Total amount</h4>
        <!-- TODO: wired up to update the stream rate + that's what you're submitting -->
        <TextInput
          variant={{ type: 'number', min: 0 }}
          bind:value={totalAmount}
          suffix="DAI"
          style="width: fit-content;"
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
          variant={{ type: 'number', min: 0 }}
          bind:value={topUpAmount}
          suffix="DAI"
          style="width: fit-content;"
          validationState={topUpExceedsBalance
            ? {
                type: 'invalid',
                message: `You only have ${
                  (daiBalance && currencyFormat(daiBalance)) ?? '...'
                } DAI`
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
