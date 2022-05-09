<script lang="ts">
  import { timeframeFormat } from '$lib/utils/format';
  import type { Workstream } from '$lib/stores/workstreams/types';
  import Rate from '$components/Rate.svelte';

  export let workstream: Workstream;
</script>

<div class="spread">
  <Rate
    ratePerSecond={workstream.ratePerSecond}
    total={workstream.total}
    showTotal={true}
  />
  <p class="timeframe">for {timeframeFormat(workstream.durationDays)}</p>
</div>

<style>
  .spread {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 0.4rem;
  }
  .timeframe {
    color: var(--color-foreground-level-6);
  }
</style>
