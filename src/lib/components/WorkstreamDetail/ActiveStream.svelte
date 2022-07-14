<script lang="ts">
  import * as modal from '$lib/utils/modal';
  import Card from '$components/Card.svelte';
  import User from '$components/User.svelte';
  import Rate from '$components/Rate.svelte';
  import Row from '$components/Row.svelte';
  import ApplicationModal from '$components/ApplicationModal.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import type { Application, Workstream } from '$lib/stores/workstreams/types';
  import { workstreamsStore } from '$lib/stores/workstreams';
  import { currencyFormat, padFloatString } from '$lib/utils/format';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import StepperModal from '../StepperModal/index.svelte';
  import PauseIcon from 'radicle-design-system/icons/Pause.svelte';
  import TopUpValues from '../TopUpSteps/TopUpValues.svelte';
  import PauseUnpauseStep from '../PauseStreamSteps/PauseUnpause.svelte';
  import AwaitingSafeTransactionStep from '../AwaitingSafeTransactionStep.svelte';

  export let workstream: Workstream;
  export let acceptedApplication: Application | undefined = undefined;

  const estimates = workstreamsStore.estimates;
  $: estimate = $estimates.streams[workstream.id];

  $: enrichedWorkstream = $workstreamsStore[workstream.id];
  $: isOwner = workstream.creator === $walletStore.address;
  $: isReceiver = workstream.acceptedApplication === $walletStore.address;
  $: activeSince =
    enrichedWorkstream?.onChainData?.streamSetUp &&
    new Date(
      enrichedWorkstream.onChainData?.dripsUpdatedEvents[0].fromBlock
        .timestamp * 1000
    );

  function pauseUnpause(action: 'pause' | 'unpause') {
    modal.show(
      StepperModal,
      async () => {
        await workstreamsStore.getWorkstream(workstream.id, undefined, true);
      },
      {
        steps: [
          PauseUnpauseStep,
          $walletStore.safe?.ready && AwaitingSafeTransactionStep
        ],
        stepProps: {
          enrichedWorkstream,
          action
        }
      }
    );
  }

  function topUp() {
    modal.show(StepperModal, undefined, {
      stepProps: {
        enrichedWorkstream
      },
      steps: [
        TopUpValues,
        $walletStore.safe?.ready && AwaitingSafeTransactionStep
      ]
    });
  }
</script>

<Card hoverable={false}>
  <div slot="top">
    <h3 style="margin-bottom: 1rem;">Active stream</h3>
    <div class="timerate">
      <div style="text-align: right;">
        {#if enrichedWorkstream?.onChainData}
          <Rate
            ratePerSecond={enrichedWorkstream.onChainData.amtPerSec}
            total={workstream.total}
          />
        {/if}
      </div>
      <div>
        {#if activeSince}
          <p class="timeframe">
            Active since {Intl.DateTimeFormat('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: 'numeric'
            }).format(activeSince)}
          </p>
        {/if}
      </div>
    </div>
  </div>
  <div slot="bottom">
    <Row>
      <div slot="left">
        <User address={acceptedApplication.creator} />
      </div>
      <div slot="right" class="row-actions">
        {#if (isReceiver || isOwner) && estimate?.remainingBalance}
          <p class="proposal">
            {padFloatString(currencyFormat(estimate.remainingBalance.wei))} DAI left
          </p>
        {/if}
        <Button
          on:click={() =>
            modal.show(ApplicationModal, undefined, {
              workstream,
              application: acceptedApplication
            })}>View application</Button
        >
      </div>
    </Row>
    <div class="stream-actions">
      <div style="display: flex; gap: .75rem;">
        {#if isOwner && $walletStore.ready}
          {#if estimate && estimate.paused === false && estimate.remainingBalance.wei > BigInt(0)}
            <Button
              variant="primary-outline"
              on:click={() => pauseUnpause('pause')}
              icon={PauseIcon}>Pause</Button
            >
          {:else if estimate && estimate.paused && estimate.remainingBalance.wei > BigInt(0)}
            <Button
              variant="primary-outline"
              on:click={() => pauseUnpause('unpause')}
              icon={PauseIcon}>Unpause</Button
            >
          {/if}
          {#if enrichedWorkstream?.onChainData?.streamSetUp && estimate && estimate.paused === false}
            <Button
              disabled={!enrichedWorkstream?.onChainData}
              on:click={() => topUp()}>Top up</Button
            >
          {/if}
        {/if}
      </div>
    </div>
  </div>
</Card>

<style>
  .proposal {
    display: flex;
    color: var(--color-primary);
    gap: 0.5rem;
  }
  .row-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .timerate {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
  }
  .timeframe {
    color: var(--color-foreground-level-6);
  }

  .stream-actions {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    margin-top: 1rem;
  }
</style>
