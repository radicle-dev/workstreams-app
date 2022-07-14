<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import StepContent from '$lib/components/StepContent.svelte';

  const dispatch = createEventDispatcher<{
    continue: never;
  }>();
</script>

<StepContent>
  <span slot="headline">Continue in your Gnosis Safe</span>
  <div slot="content">
    <p>
      Your workstream has been activated, but it won't start streaming funds
      until the transaction reaches quorum and is executed by your Gnosis Safe.
      Head over to your safe now, sign the transaction, and execute it after
      it's reached quorum.
    </p>
  </div>
  <div slot="step-actions">
    <Button on:click={() => dispatch('continue')}>Got it</Button>
  </div>
</StepContent>
