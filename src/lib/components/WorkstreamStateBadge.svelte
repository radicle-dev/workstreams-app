<script lang="ts">
  import type { EnrichedWorkstream } from '$lib/stores/workstreams';

  export let enrichedWorkstream: EnrichedWorkstream;

  $: ws = enrichedWorkstream?.data;

  enum VisualState {
    /** Stream is set up and actively dripping */
    ACTIVE,
    /** Stream is active, but no more balance is remaining in Drips account */
    OUT_OF_FUNDS,
    /** Stream was set up, but then paused by removing drip receiver */
    PAUSED,
    /** Stream state cannot be determined because the user isn't logged in.*/
    UNKNOWN
  }

  let visualState: VisualState;

  $: visualStateLabel = {
    [VisualState.ACTIVE]: 'Active',
    [VisualState.OUT_OF_FUNDS]: 'Out of funds',
    [VisualState.PAUSED]: 'Paused',
    [VisualState.UNKNOWN]: 'Log in to see status'
  }[visualState];

  $: visualStateColor = {
    [VisualState.ACTIVE]: '--color-positive',
    [VisualState.OUT_OF_FUNDS]: '--color-negative',
    [VisualState.PAUSED]: '--color-caution',
    [VisualState.UNKNOWN]: '--color-foreground'
  }[visualState];

  $: {
    if (!enrichedWorkstream.onChainData.currentlyStreaming) {
      visualState = enrichedWorkstream.onChainData.paused
        ? VisualState.PAUSED
        : VisualState.OUT_OF_FUNDS;
    } else {
      visualState = VisualState.ACTIVE;
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
