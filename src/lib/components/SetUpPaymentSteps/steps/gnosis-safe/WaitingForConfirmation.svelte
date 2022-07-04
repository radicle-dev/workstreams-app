<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from 'radicle-design-system/Button.svelte';

  const dispatch = createEventDispatcher<{
    continue: never;
  }>();
</script>

<div>
  <h1>Continue in your Gnosis Safe</h1>
  <p>
    Your workstream has been activated, but it won't start streaming funds until
    the transaction reaches quorum and is executed by your Gnosis Safe.
  </p>
  <Button on:click={() => dispatch('continue')}>Got it</Button>
</div>
