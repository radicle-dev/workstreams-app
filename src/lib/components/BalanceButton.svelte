<script lang="ts">
  import { fly } from 'svelte/transition';
  import Button from 'radicle-design-system/Button.svelte';
  import TopUpIcon from 'radicle-design-system/icons/Topup.svelte';
  import InfoCircle from 'radicle-design-system/icons/InfoCircle.svelte';

  import * as modal from '$lib/utils/modal';
  import drips from '$lib/stores/drips';
  import { currencyFormat, padFloatString } from '$lib/utils/format';
  import { workstreamsStore } from '$lib/stores/workstreams';
  import LoadingDots from './LoadingDots.svelte';
  import { goto } from '$app/navigation';
  import StepperModal from '$lib/components/StepperModal/index.svelte';
  import Intro from '$lib/components/WithdrawSteps/Intro.svelte';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import AwaitingSafeTransactionStep from './AwaitingSafeTransactionStep.svelte';

  const estimates = workstreamsStore.estimates;

  $: currentCycleBalanceEstimate =
    $estimates.earnedInCurrentCycle !== undefined &&
    currencyFormat($estimates.earnedInCurrentCycle);

  $: withdrawable =
    $drips.collectable && currencyFormat($drips.collectable.wei);
  let hover = false;

  $: currentBalance =
    withdrawable &&
    currentCycleBalanceEstimate &&
    currencyFormat(
      ($drips.collectable?.wei ?? BigInt(0)) +
        ($estimates.earnedInCurrentCycle?.wei ?? BigInt(0))
    );

  $: formattedCycleEnd = $drips.cycle && {
    date: Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format($drips.cycle.end),
    time: Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format($drips.cycle.end)
  };

  $: collectBlocked = $drips.collectable?.wei === BigInt(0);

  async function collect() {
    modal.show(StepperModal, undefined, {
      steps: [Intro, $walletStore.safe?.ready && AwaitingSafeTransactionStep]
    });
  }

  function navigate(path: string) {
    hover = false;
    goto(path);
  }
</script>

<div
  class="balance-button"
  on:mouseleave={() => (hover = false)}
  on:mouseenter={() => (hover = true)}
>
  <Button on:click={() => navigate('/history')} variant="outline">
    <span class="typo-text-mono">
      {#if currentBalance}
        {padFloatString(currentBalance)} DAI
      {:else}
        <LoadingDots />
      {/if}
    </span>
  </Button>
  {#if hover}
    <div class="hover-pad" />
    <div in:fly={{ y: 10 }} out:fly={{ y: 10 }} class="dropdown">
      <div class="amounts">
        <div class="title-value withdrawable">
          <p class="typo-text title">Withdrawable now</p>
          <h2 class="value">
            {#if withdrawable}
              {padFloatString(withdrawable)} DAI
            {:else}
              <LoadingDots />
            {/if}
          </h2>
        </div>
        <div class="title-value balance">
          <p class="typo-text title">
            Withdrawable {formattedCycleEnd?.date ?? '...'}
          </p>
          <h2 class="value">
            {#if currentCycleBalanceEstimate}
              +{padFloatString(currentCycleBalanceEstimate)} DAI
            {:else}
              <LoadingDots />
            {/if}
          </h2>
        </div>
      </div>
      <div class="info">
        <InfoCircle />
        <p>
          While you’re earning in real-time, your withdrawable amount is updated
          once every thirty days.
          {#if formattedCycleEnd}
            It will update next on {formattedCycleEnd.date}
            at {formattedCycleEnd.time}.
          {/if}
        </p>
      </div>
      {#if withdrawable}
        <div class="actions">
          <Button disabled={collectBlocked} icon={TopUpIcon} on:click={collect}
            >Withdraw {withdrawable} DAI</Button
          >
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .balance-button {
    width: fit-content;
    display: flex;
    position: relative;
    position: flex;
    flex-direction: column;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .hover-pad {
    position: absolute;
    top: 2rem;
    right: 0;
    width: 24rem;
    height: 1rem;
  }

  .dropdown {
    padding: 1rem;
    box-shadow: var(--elevation-high);
    position: absolute;
    top: 3rem;
    right: 0;
    width: 28rem;
    border-radius: 0.5rem;
    display: flex;
    gap: 1rem;
    flex-direction: column;
    z-index: 5;
    background-color: var(--color-background);
  }

  .amounts {
    display: flex;
    gap: 0.5rem;
  }

  .title {
    color: var(--color-foreground-level-6);
  }

  .value {
    font-family: var(--typeface-mono-bold);
  }

  .balance {
    color: var(--color-foreground-level-6);
  }

  .amounts > * {
    flex: 1;
  }

  .info {
    display: flex;
    gap: 0.5rem;
    color: var(--color-foreground-level-6);
  }
</style>
