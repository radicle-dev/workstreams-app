<script lang="ts">
  import Button from 'radicle-design-system/Button.svelte';
  import { createEventDispatcher } from 'svelte';
  import StepContent from './StepContent.svelte';

  const dispatch = createEventDispatcher<{
    continue: never;
  }>();
</script>

<StepContent>
  <span slot="headline">Continue in your safe</span>
  <div slot="content">
    <p>
      Head over to your Gnosis Safe, where you should find the transaction
      request within the WalletConnect Safe App. After signing the transaction,
      it will be proposed to your safe.
    </p>
    <p>
      Once quorum has been reached and the transaction is executed, the
      Workstreams UI will update accordingly.
    </p>
  </div>
  <div slot="step-actions">
    <Button on:click={() => dispatch('continue')}>Got it</Button>
  </div>
</StepContent>

<style>
  p {
    margin-bottom: 1rem;
  }
</style>
