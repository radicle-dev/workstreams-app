<script lang="ts">
  import type { Workstream } from '$lib/stores/workstreams/types';
  import RateTotal from '$components/RateTotal.svelte';
  import Timeframe from '$components/Timeframe.svelte';

  export let workstream: Workstream;
</script>

<div class="spread">
  <RateTotal
    rate={workstream.payment.rate}
    currency={workstream.payment.currency}
    duration={workstream.duration}
  />
  <Timeframe duration={workstream.duration} />
</div>

<style>
  .spread {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: flex-end;
  }
</style>
