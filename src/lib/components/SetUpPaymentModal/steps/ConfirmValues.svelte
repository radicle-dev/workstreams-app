<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import User from '$lib/components/User.svelte';
  import drips from '$lib/stores/drips';
  import type { Application, Workstream } from '$lib/stores/workstreams/types';
  import { currencyFormat } from '$lib/utils/format';
  import ButtonRow from '../components/ButtonRow.svelte';
  import { workstreamsStore } from '$lib/stores/workstreams/workstreams';
  import TextInput from '$lib/components/TextInput.svelte';
  import { parseUnits } from 'ethers/lib/utils';

  const dispatch = createEventDispatcher();

  export let application: Application;
  export let workstream: Workstream;

  let actionInFlight = false;
  let daiBalance: bigint | undefined;

  let topUpAmount = '0';

  onMount(async () => {
    daiBalance = (await drips.getDaiBalance()).toBigInt();

    topUpAmount =
      daiBalance < workstream.total.wei
        ? currencyFormat(daiBalance)
        : currencyFormat(workstream.total.wei);
  });

  async function setUpPayment() {
    actionInFlight = true;

    const createDripCall = await drips.createDrip(
      application.creator,
      workstream.ratePerSecond,
      parseUnits(topUpAmount).toBigInt()
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
  }
</script>

<div>
  <p>
    Here's the drips config we're gonna set up. This should probably be editable
    at some point.
    <br />
    Streaming to:
    <span class="inline-user"><User address={application.creator} /></span><br
    />
    Dai wei per second: {workstream.ratePerSecond.wei.toString()}<br />
    Workstream total: {currencyFormat(workstream.total)}<br />
    Your current DAI balance: {daiBalance && currencyFormat(daiBalance)}<br />
    Top up for: <TextInput bind:value={topUpAmount} suffix="DAI" />
  </p>
  <ButtonRow
    disabled={actionInFlight ||
      daiBalance < parseUnits(topUpAmount || '0').toBigInt()}
    buttonText="Set up drip & top up"
    on:continue={setUpPayment}
  />
</div>

<style>
  .inline-user {
    display: inline-block;
  }
</style>
