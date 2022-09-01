<script lang="ts">
  import type { Workstream } from '$lib/stores/workstreams/types';

  export let workstream: Workstream;
</script>

<div>
  <h4>{workstream.title}</h4>
</div>

<style>
  div {
    display: flex;
    align-items: center;
    height: 100%;
    justify-content: space-between;
  }
</style>
