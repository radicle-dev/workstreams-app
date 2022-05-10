<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import drips from '$lib/stores/drips';
  import Spinner from 'radicle-design-system/Spinner.svelte';
  import { onMount } from 'svelte';
  import ButtonRow from '../components/ButtonRow.svelte';

  const dispatch = createEventDispatcher();

  let approvalGranted: boolean | undefined = undefined;
  let actionInFlight = false;

  onMount(async () => {
    const allowance = await drips.getAllowance();

    if (!allowance.isZero()) {
      dispatch('continue');
    } else {
      approvalGranted = false;
    }
  });

  async function grantPermission() {
    actionInFlight = true;
    const tx = await drips.approveDaiSpend();

    const waitResult = await tx.wait(1);

    if (waitResult.status === 1) {
      dispatch('continue');
    } else {
      actionInFlight = false;
    }
  }
</script>

<div>
  {#if approvalGranted === false}
    First, you need to allow the Drips contract to spend your DAI. Please grant
    permission below.
    <ButtonRow
      disabled={actionInFlight}
      buttonText="Allow drips contract"
      on:continue={grantPermission}
    />
  {:else if approvalGranted === undefined}
    <Spinner />
  {/if}
</div>
