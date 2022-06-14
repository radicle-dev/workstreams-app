<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import drips from '$lib/stores/drips';
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import Spinner from 'radicle-design-system/Spinner.svelte';
  import { onMount } from 'svelte';
  import ButtonRow from '../components/ButtonRow.svelte';
  import type { AwaitPendingPayload } from '$lib/components/StepperModal/types';

  const dispatcher = createEventDispatcher<{
    awaitPending: AwaitPendingPayload;
    continue: never;
  }>();

  let approvalGranted: boolean | undefined = undefined;
  let actionInFlight = false;

  onMount(async () => {
    const allowance = await drips.getAllowance();

    if (!allowance.isZero()) {
      dispatcher('continue');
    } else {
      approvalGranted = false;
    }
  });

  async function grantPermission() {
    actionInFlight = true;

    try {
      const tx = await drips.approveDaiSpend();

      const waitFor = async () => {
        const receipt = await tx.wait(1);

        if (receipt.status === 0) {
          throw new Error(`TX failed. ${receipt}`);
        }
      };

      dispatcher('awaitPending', { promise: waitFor });
    } catch {
      actionInFlight = false;
    }
  }
</script>

<div>
  <Emoji emoji="💸" size="large" />
  <h1>Grant permissions</h1>
  {#if approvalGranted === false}
    You need to allow the Drips contract to spend your DAI.
    <ButtonRow
      disabled={actionInFlight}
      buttonText="Allow drips contract"
      on:continue={grantPermission}
    />
  {:else if approvalGranted === undefined}
    <Spinner />
  {/if}
</div>

<style>
  h1 {
    margin: 1rem 0 2rem;
    color: var(--color-foreground);
  }
</style>
