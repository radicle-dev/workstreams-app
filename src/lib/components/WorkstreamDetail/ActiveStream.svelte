<script lang="ts">
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import type { DripsReceiverStructOutput } from 'drips-sdk';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';

  import * as modal from '$lib/utils/modal';
  import Card from '$components/Card.svelte';
  import User from '$components/User.svelte';
  import Rate from '$components/Rate.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import {
    Currency,
    WorkstreamState,
    type Workstream
  } from '$lib/stores/workstreams/types';
  import { workstreamsStore } from '$lib/stores/workstreams';
  import { currencyFormat, padFloatString } from '$lib/utils/format';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import StepperModal from '../StepperModal/index.svelte';
  import PauseIcon from 'radicle-design-system/icons/Pause.svelte';
  import TopUpValues from '../TopUpSteps/TopUpValues.svelte';
  import PauseUnpauseStep from '../PauseStreamSteps/PauseUnpause.svelte';
  import AwaitingSafeTransactionStep from '../AwaitingSafeTransactionStep.svelte';
  import WorkstreamStateBadge from '../WorkstreamStateBadge.svelte';

  import IntroStep from '../SetUpPaymentSteps/steps/Intro.svelte';
  import SetDaiAllowanceStep from '../SetUpPaymentSteps/steps/SetDaiAllowance.svelte';
  import ConfirmValuesStep from '../SetUpPaymentSteps/steps/ConfirmValues.svelte';

  import GnosisSafeSetDaiAllowance from '../SetUpPaymentSteps/steps/gnosis-safe/SetDaiAllowance.svelte';
  import GnosisSafeConfirmValuesStep from '../SetUpPaymentSteps/steps/gnosis-safe/ConfirmValues.svelte';
  import GnosisSafeWaitingForConfirmationStep from '../SetUpPaymentSteps/steps/gnosis-safe/WaitingForConfirmation.svelte';

  export let workstream: Workstream;

  const estimates = workstreamsStore.estimates;
  $: estimate = $estimates.workstreams[workstream.id];

  $: enrichedWorkstream = $workstreamsStore.workstreams[workstream.id];
  $: isOwner = workstream.creator === $walletStore.address;

  function refreshStream() {
    workstreamsStore.getWorkstream(enrichedWorkstream.data.id);
  }

  function pauseUnpause(action: 'pause' | 'unpause') {
    modal.show(StepperModal, () => refreshStream(), {
      steps: [
        PauseUnpauseStep,
        $walletStore.safe?.ready && AwaitingSafeTransactionStep
      ],
      stepProps: {
        enrichedWorkstream,
        action
      }
    });
  }

  function topUp() {
    modal.show(StepperModal, () => refreshStream(), {
      stepProps: {
        enrichedWorkstream
      },
      steps: [
        TopUpValues,
        $walletStore.safe?.ready && AwaitingSafeTransactionStep
      ]
    });
  }

  $: lastStreamRate =
    enrichedWorkstream?.onChainData?.dripsUpdatedEvents
      .reduce<DripsReceiverStructOutput[]>(
        (prev, dew) => [...prev, ...dew.event.args.receivers],
        []
      )
      .filter(
        (r) => r.receiver.toLowerCase() === workstream.acceptedApplication
      )
      .find((r) => !r.amtPerSec.isZero())
      ?.amtPerSec?.toBigInt() || workstream.ratePerSecond.wei;

  $: setUpPaymentSteps = $walletStore.safe?.address
    ? [
        IntroStep,
        GnosisSafeSetDaiAllowance,
        GnosisSafeConfirmValuesStep,
        GnosisSafeWaitingForConfirmationStep
      ]
    : [IntroStep, SetDaiAllowanceStep, ConfirmValuesStep];
</script>

<Card hoverable={false}>
  <div slot="top">
    <div class="header">
      <h3 style="margin-bottom: 1rem;">Payment stream</h3>
      <WorkstreamStateBadge {enrichedWorkstream} />
    </div>
  </div>
  <div slot="bottom" class="content">
    <div class:active={estimate?.currentlyStreaming} class="cashflow">
      <User address={workstream.creator} />
      <div class="flowline" />
      <User address={workstream.acceptedApplication} />
    </div>
    <div class="rate">
      <Rate
        ratePerSecond={{ wei: lastStreamRate, currency: Currency.DAI }}
        total={workstream.total}
      />
      {#if estimate?.remainingBalance}
        <span class="remaining">
          • <span class="amount typo-text-bold"
            >{padFloatString(currencyFormat(estimate.remainingBalance.wei))} DAI</span
          > left
        </span>
      {/if}
    </div>
    {#if isOwner && $walletStore.ready}
      <div class="stream-actions">
        <div style="display: flex; gap: .75rem;">
          {#if estimate && estimate.paused === false && estimate.remainingBalance.wei > BigInt(0)}
            <Button
              variant="outline"
              on:click={() => pauseUnpause('pause')}
              icon={PauseIcon}>Pause</Button
            >
          {:else if estimate && estimate.paused && estimate.remainingBalance.wei > BigInt(0)}
            <Button
              variant="primary"
              on:click={() => pauseUnpause('unpause')}
              icon={PauseIcon}>Unpause</Button
            >
          {/if}
          {#if workstream.state === WorkstreamState.PENDING}
            <Button
              on:click={() =>
                modal.show(StepperModal, undefined, {
                  stepProps: {
                    workstream
                  },
                  steps: setUpPaymentSteps
                })}
              variant="primary"
              icon={TokenStreams}>Set up stream</Button
            >
          {/if}
          {#if enrichedWorkstream?.onChainData?.streamSetUp && estimate && estimate.paused === false}
            <Button
              icon={Plus}
              disabled={!enrichedWorkstream?.onChainData}
              on:click={() => topUp()}>Top up</Button
            >
          {/if}
        </div>
      </div>
    {/if}
  </div>
</Card>

<style>
  .header {
    display: flex;
    justify-content: space-between;
  }

  .cashflow {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .cashflow > .flowline {
    flex-grow: 1;
    height: 0.25rem;
    border-radius: 0.25rem;
    background: var(--color-foreground-level-3);
    background-position: 0% 50%;
  }

  .active.cashflow > .flowline {
    height: 0.5rem;
    background: url('/assets/Flowline-dot.svg') repeat-x,
      var(--color-primary-level-2);
    animation: gradientAnimation 1s linear infinite;
  }

  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 10px 50%;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .rate {
    display: flex;
    gap: 0.25rem;
  }

  .remaining {
    color: var(--color-foreground-level-5);
  }

  .amount {
    color: var(--color-primary);
  }

  .stream-actions {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    margin-top: 1rem;
  }
</style>
