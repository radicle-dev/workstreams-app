<script lang="ts">
  import Card from '$components/Card.svelte';
  import TimeRate from '$components/TimeRate.svelte';
  import type { Workstream } from '$lib/stores/workstreams/types';
  import ApplyButton from '../ApplyButton.svelte';

  export let workstream: Workstream;
</script>

<Card hoverable={false}>
  <div slot="top">
    <div class="timerate">
      <TimeRate {workstream} />
      <ApplyButton {workstream} />
    </div>
  </div>
</Card>

<style>
  .timerate {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
  }
</style>
