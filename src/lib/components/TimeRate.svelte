<script lang="ts">
  import type { Workstream } from '$lib/stores/workstreams/types';
  import { WorkstreamType } from '$lib/stores/workstreams/types';
  import RateTotal from '$components/RateTotal.svelte';
  import Timeframe from '$components/Timeframe.svelte';

  export let workstream: Workstream;

  let duration =
    workstream.type === WorkstreamType.GRANT && workstream.duration
      ? workstream.duration
      : undefined;
</script>

<div class="spread">
  <RateTotal
    rate={workstream.payment.rate}
    currency={workstream.payment.currency}
    {duration}
  />
  <Timeframe {duration} />
</div>

<style>
  .spread {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: flex-end;
  }
</style>
