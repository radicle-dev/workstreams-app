<script lang="ts">
  import type { EnrichedWorkstream } from '$lib/stores/workstreams';
  import User from '$components/User.svelte';
  export let enrichedWorkstream: EnrichedWorkstream;
</script>

<div class="title">
  <h3 style="margin-right: 0.75rem;" class="typo-overflow-ellipsis">
    {enrichedWorkstream.data.title}
  </h3>
</div>
<div class="owner">
  <User address={enrichedWorkstream.data.creator} />
</div>

<style>
  .title,
  .owner {
    display: flex;
    align-items: center;
  }
  .title {
    margin-bottom: 0.5rem;
    justify-content: space-between;
  }
</style>
