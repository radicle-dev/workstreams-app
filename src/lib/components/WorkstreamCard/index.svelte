<script lang="ts">
  import { goto, prefetch } from '$app/navigation';
  import { hyphenateString } from '$lib/utils/format';

  import Card from '$components/Card.svelte';
  import TitleMeta from '$components/TitleMeta.svelte';
  import TimeRate from '$components/TimeRate.svelte';
  import Actions from './Actions.svelte';
  import type { EnrichedWorkstream } from '$lib/stores/workstreams';

  export let enrichedWorkstream: EnrichedWorkstream;

  $: url = `/workstream/${hyphenateString(enrichedWorkstream.data.id)}`;
</script>

<Card on:click={() => goto(url)} on:hover={() => prefetch(url)}>
  <div slot="top">
    <TitleMeta workstream={enrichedWorkstream.data} />
  </div>
  <div slot="bottom" class="content">
    <TimeRate
      workstream={enrichedWorkstream.data}
      onChainData={enrichedWorkstream.onChainData}
    />
    <Actions {enrichedWorkstream} />
  </div>
</Card>

<style>
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
</style>
