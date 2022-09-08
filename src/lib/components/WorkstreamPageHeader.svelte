<script lang="ts">
  import type { EnrichedWorkstream } from '$lib/stores/workstreams';

  export let workstream: EnrichedWorkstream;
</script>

<div>
  <h4>{workstream.data.title}</h4>
</div>

<style>
  div {
    display: flex;
    align-items: center;
    height: 100%;
    justify-content: space-between;
  }
</style>
