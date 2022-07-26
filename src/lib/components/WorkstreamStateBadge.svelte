<script lang="ts">
  import {
    workstreamsStore,
    type EnrichedWorkstream
  } from '$lib/stores/workstreams';
  import { WorkstreamState } from '$lib/stores/workstreams/types';

  const estimates = workstreamsStore.estimates;

  export let enrichedWorkstream: EnrichedWorkstream;

  $: ws = enrichedWorkstream.data;
  $: estimate = $estimates.workstreams[ws.id];

  enum VisualState {
    /** Stream is set up and actively dripping */
    ACTIVE,
    /** Transaction to set up Drip is pending in Gnosis Safe */
    PENDING_CONFIRMATION,
    /** Stream is active, but no more balance is remaining in Drips account */
    OUT_OF_FUNDS,
    /** Stream was set up, but then paused by removing drip receiver */
    PAUSED,
    /** Stream marked as closed via API */
    CLOSED
  }

  let visualState: VisualState;

  $: visualStateLabel = {
    [VisualState.ACTIVE]: 'Active',
    [VisualState.PENDING_CONFIRMATION]: 'Pending confirmation',
    [VisualState.OUT_OF_FUNDS]: 'Out of funds',
    [VisualState.PAUSED]: 'Paused',
    [VisualState.CLOSED]: 'Closed'
  }[visualState];

  $: visualStateColor = {
    [VisualState.ACTIVE]: '--color-positive',
    [VisualState.OUT_OF_FUNDS]: '--color-negative',
    [VisualState.PAUSED]: '--color-caution',
    [VisualState.PENDING_CONFIRMATION]: '--color-caution',
    [VisualState.CLOSED]: '--color-foreground'
  }[visualState];

  $: {
    switch (ws.state) {
      case WorkstreamState.ACTIVE: {
        if (
          enrichedWorkstream?.onChainData &&
          !enrichedWorkstream.onChainData.streamSetUp
        ) {
          visualState = VisualState.PENDING_CONFIRMATION;
        } else if (estimate && !estimate.currentlyStreaming) {
          visualState = estimate.paused
            ? VisualState.PAUSED
            : VisualState.OUT_OF_FUNDS;
        } else {
          visualState = VisualState.ACTIVE;
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

<div
  class="state-badge"
  style={`background-color: var(${visualStateColor}-level-1`}
>
  <span class="typo-text-bold" style={`color: var(${visualStateColor}-level-6`}
    >{visualStateLabel}</span
  >
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
