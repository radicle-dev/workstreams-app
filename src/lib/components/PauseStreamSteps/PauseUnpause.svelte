<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from 'radicle-design-system/Button.svelte';

  import * as modal from '$lib/utils/modal';
  import StepContent from '../StepContent.svelte';
  import workstreamsStore, {
    type EnrichedWorkstream
  } from '$lib/stores/workstreams';
  import drips from '$lib/stores/drips';
  import type { AwaitPendingPayload } from '../StepperModal/types';

  const dispatch = createEventDispatcher<{
    continue: never;
    awaitPending: AwaitPendingPayload;
  }>();

  export let enrichedWorkstream: EnrichedWorkstream;
  export let action: 'pause' | 'unpause';

  $: actionLabel = action.charAt(0).toUpperCase() + action.slice(1);

  function pauseUnpause() {
    const waitFor = async () => {
      const tx = await drips.pauseUnpause(action, enrichedWorkstream);
      await tx.wait(1);
      await workstreamsStore.fetchWorkstream(enrichedWorkstream.cid);
    };

    dispatch('awaitPending', {
      promise: waitFor
    });
  }

  function cancel() {
    modal.hide();
  }
</script>

<StepContent>
  <span slot="headline">{actionLabel} workstream</span>
  <div slot="content">
    {#if action === 'pause'}
      <p>
        After pausing the stream, funds will stop streaming immediately, but the
        workstream will remain topped-up with its current balance.
      </p>
      <p>You may unpause the stream at any point in the future.</p>
    {:else}
      <p>
        After resuming the stream, funds will begin streaming immediately, at
        the displayed rate.
      </p>
      <p>You may pause the stream again at any point in the future.</p>
    {/if}
  </div>
  <div slot="step-actions">
    <Button variant="outline" on:click={cancel}>Cancel</Button>
    <Button on:click={pauseUnpause}>{actionLabel} stream</Button>
  </div>
</StepContent>

<style>
  p {
    margin-bottom: 1rem;
  }
</style>
