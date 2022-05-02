<script lang="ts">
  import { timeframeFormat } from '$lib/utils/format';
  import type { Workstream } from '$lib/stores/workstreams/types';
  import Rate from '$components/Rate.svelte';

  export let workstream: Workstream;
</script>

<div class="spread">
  <Rate
    rate={workstream.payment.rate}
    currency={workstream.payment.currency}
    duration={workstream.duration}
    total={true}
  />
  <p class="timeframe">for {timeframeFormat(workstream.duration)}</p>
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
