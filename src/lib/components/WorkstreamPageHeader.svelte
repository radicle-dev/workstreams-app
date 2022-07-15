<script lang="ts">
  import type { Workstream } from '$lib/stores/workstreams/types';
  import ApplyButton from './ApplyButton.svelte';

  export let workstream: Workstream;
</script>

<div>
  <h4>{workstream.title}</h4>
  <ApplyButton {workstream} tooltipPosition="left" />
</div>

<style>
  div {
    display: flex;
    align-items: center;
    height: 100%;
    justify-content: space-between;
  }
</style>
