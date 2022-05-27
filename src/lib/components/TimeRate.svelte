<script lang="ts">
  import { timeframeFormat } from '$lib/utils/format';
  import { Currency, type Workstream } from '$lib/stores/workstreams/types';
  import Rate from '$components/Rate.svelte';
  import type { OnChainData } from '$lib/stores/workstreams';

  export let workstream: Workstream;
  export let onChainData: OnChainData | undefined = undefined;

  $: totalWei = onChainData
    ? onChainData.amtPerSec.wei *
      BigInt(86400) *
      BigInt(workstream.durationDays)
    : workstream.total.wei;

  $: total = {
    currency: Currency.DAI,
    wei: totalWei
  };
</script>

<div class="spread">
  <Rate ratePerSecond={workstream.ratePerSecond} {total} showTotal={true} />
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
