<script lang="ts">
  import {
    workstreamsStore,
    type EnrichedWorkstream
  } from '$lib/stores/workstreams';
  import { WorkstreamState } from '$lib/stores/workstreams/types';

  const estimates = workstreamsStore.estimates;

  export let enrichedWorkstream: EnrichedWorkstream;

  $: ws = enrichedWorkstream?.data;
  $: estimate = ws && $estimates.workstreams[ws.id];

  enum VisualState {
    /** Stream is set up and actively dripping */
    ACTIVE,
    /** Stream needds to be created by the creator */
    PENDING_SETUP,
    /** Stream is active, but no more balance is remaining in Drips account */
    OUT_OF_FUNDS,
    /** Stream was set up, but then paused by removing drip receiver */
    PAUSED,
    /** Stream marked as closed via API */
    CLOSED,
    /** Stream state cannot be determined because the user isn't logged in.*/
    UNKNOWN
  }

  let visualState: VisualState;

  $: visualStateLabel = {
    [VisualState.ACTIVE]: 'Active',
    [VisualState.PENDING_SETUP]: 'Pending setup',
    [VisualState.OUT_OF_FUNDS]: 'Out of funds',
    [VisualState.PAUSED]: 'Paused',
    [VisualState.CLOSED]: 'Closed',
    [VisualState.UNKNOWN]: 'Log in to see status'
  }[visualState];

  $: visualStateColor = {
    [VisualState.ACTIVE]: '--color-positive',
    [VisualState.PENDING_SETUP]: '--color-caution',
    [VisualState.OUT_OF_FUNDS]: '--color-negative',
    [VisualState.PAUSED]: '--color-caution',
    [VisualState.CLOSED]: '--color-foreground',
    [VisualState.UNKNOWN]: '--color-foreground'
  }[visualState];

  $: {
    switch (ws?.state) {
      case WorkstreamState.ACTIVE: {
        if (
          enrichedWorkstream?.onChainData &&
          !enrichedWorkstream.onChainData.streamSetUp
        ) {
          visualState = VisualState.PENDING_SETUP;
        } else if (estimate && !estimate.currentlyStreaming) {
          visualState = estimate.paused
            ? VisualState.PAUSED
            : VisualState.OUT_OF_FUNDS;
        } else if (enrichedWorkstream?.onChainData?.streamSetUp) {
          visualState = VisualState.ACTIVE;
        } else if (enrichedWorkstream) {
          visualState = VisualState.UNKNOWN;
        }
        break;
      }
      case WorkstreamState.CLOSED: {
        visualState = VisualState.CLOSED;
        break;
      }
    }
  }
</script>

<div>
  {#if ws}
    <div
      class="state-badge"
      style={`background-color: var(${visualStateColor}-level-1`}
    >
      <span
        class="typo-text-bold"
        style={`color: var(${visualStateColor}-level-6`}
        >{visualStateLabel}</span
      >
    </div>
  {/if}
</div>

<style>
  .state-badge {
    display: flex;
    align-items: center;
    height: 1.5rem;
    flex-shrink: 0;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
</style>
