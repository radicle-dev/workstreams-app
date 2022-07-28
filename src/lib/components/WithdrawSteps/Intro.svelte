<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Topup from 'radicle-design-system/icons/Topup.svelte';

  import StepContent from '$lib/components/StepContent.svelte';
  import drips from '$lib/stores/drips';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import { currencyFormat, formatAddress } from '$lib/utils/format';
  import Button from 'radicle-design-system/Button.svelte';
  import type { AwaitPendingPayload } from '$lib/components/StepperModal/types';

  const dispatch = createEventDispatcher<{
    continue: never;
    awaitPending: AwaitPendingPayload;
  }>();

  $: withdrawable = $drips?.collectable && currencyFormat($drips.collectable);

  async function withdraw() {
    const waitFor = async () => {
      if ($walletStore.safe?.ready) {
        drips.collect();
      } else {
        const tx = await drips.collect();
        await tx.wait(1);
        await Promise.all([
          drips.updateCollectable(),
          drips.updateCollectHistory()
        ]);
      }
    };

    dispatch('awaitPending', {
      promise: waitFor
    });
  }
</script>

<StepContent>
  <span slot="headline">Withdraw funds</span>
  <div slot="content">
    <p>
      You can currently withdraw <span class="typo-text-bold"
        >{withdrawable} DAI</span
      >
      from Workstreams. After your withdrawal transaction is confirmed, your DAI
      will be sent to your address
      <span class="typo-text-bold">{formatAddress($walletStore.address)}</span>.
    </p>
    <p class="typo-text-small">
      Please note that while you're earning in real-time, your withdrawable
      amount updates once a week.
      {#if $drips.cycle?.end}
        It will update next on {Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric'
        }).format($drips.cycle.end)}
        at {Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }).format($drips.cycle.end)}.
      {/if}
    </p>
  </div>
  <div slot="step-actions">
    <Button icon={Topup} on:click={withdraw}>Withdraw {withdrawable} DAI</Button
    >
  </div>
</StepContent>

<style>
  p {
    margin-bottom: 1rem;
  }
</style>
