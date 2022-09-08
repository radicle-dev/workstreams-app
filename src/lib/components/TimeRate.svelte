<script lang="ts">
  import type { EnrichedWorkstream, Money } from '$lib/stores/workstreams';
  import Rate from '$components/Rate.svelte';

  export let enrichedWorkstream: EnrichedWorkstream;

  $: totalWei = enrichedWorkstream.data.streamTarget.wei;

  $: total = {
    currency: 'dai',
    wei: totalWei
  } as Money;
</script>

<div class="spread">
  <Rate
    ratePerSecond={enrichedWorkstream.onChainData.amtPerSec}
    {total}
    showTotal={true}
  />
</div>

<style>
  .spread {
    display: flex;
    flex-direction: column;
  }
</style>
