<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import * as modal from '$lib/utils/modal';
  import drips from '$lib/stores/drips';
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import Spinner from 'radicle-design-system/Spinner.svelte';
  import { onMount } from 'svelte';
  import ButtonRow from '../../components/ButtonRow.svelte';
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
      drips.approveDaiSpend();
      modal.hide();
    } catch {
      actionInFlight = false;
    }
  }
</script>

<div>
  <Emoji emoji="💸" size="large" />
  <h1>Grant permissions</h1>
  {#if approvalGranted === false}
    <p>
      You need to allow the Radicle Drips contract to access the DAI in your
      Gnosis Safe before creating a stream. After clicking <span
        class="typo-text-bold">Allow drips contract</span
      >
      below, you'll find a transaction prompt within the Gnosis Safe app. After you
      sign the transaction and it reaches quorum and is executed by your safe, re-trigger
      the payment setup flow and you'll be able to proceed.
    </p>
    <p class="typo-text-small">You only have to do this once.</p>
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

  p {
    margin-bottom: 1rem;
  }
</style>
