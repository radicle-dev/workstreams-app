<script lang="ts">
  import type { Workstream } from '$lib/stores/workstreams/types';
  import Rate from '$components/Rate.svelte';
  import Timeframe from '$components/Timeframe.svelte';

  export let workstream: Workstream;
</script>

<div class="spread">
  <Rate
    rate={workstream.payment.rate}
    currency={workstream.payment.currency}
    duration={workstream.duration}
    total={true}
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
