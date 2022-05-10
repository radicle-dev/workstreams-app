<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import User from '$lib/components/User.svelte';
  import drips from '$lib/stores/drips';
  import type { Application, Workstream } from '$lib/stores/workstreams/types';
  import { currencyFormat } from '$lib/utils/format';
  import ButtonRow from '../components/ButtonRow.svelte';
  import { workstreamsStore } from '$lib/stores/workstreams/workstreams';

  const dispatch = createEventDispatcher();

  export let application: Application;
  export let workstream: Workstream;

  let actionInFlight = false;

  async function setUpPayment() {
    actionInFlight = true;

    const tx = await drips.createDrip(
      application.creator,
      workstream.ratePerSecond,
      workstream.total.wei
    );

    const receipt = await tx.wait(1);

    if (receipt.status === 0) {
      console.error(receipt);
      return;
    }

    const activateCall = await workstreamsStore.activateWorkstream(
      workstream.id
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
    Top-up amount DAI: {currencyFormat(workstream.total)}<br />
  </p>
  <ButtonRow
    disabled={actionInFlight}
    buttonText="Set up drip & top up"
    on:continue={setUpPayment}
  />
</div>

<style>
  .inline-user {
    display: inline-block;
  }
</style>
