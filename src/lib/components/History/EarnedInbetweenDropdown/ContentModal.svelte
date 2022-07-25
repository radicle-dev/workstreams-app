<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import type { EnrichedWorkstream } from '$lib/stores/workstreams';
  import type { Money } from '$lib/stores/workstreams/types';
  import Content from './Content.svelte';

  export let amountsEarned: { workstream: EnrichedWorkstream; amount: Money }[];
  export let timeWindow: { from: Date; to: Date };
  export let amountsSpent: { workstream: EnrichedWorkstream; amount: Money }[];
</script>

<Modal>
  <div slot="body">
    <Content {amountsEarned} {timeWindow} {amountsSpent} />
  </div>
</Modal>
