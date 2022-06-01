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
  import TopUpModal from '../TopUpModal.svelte';

  export let workstream: Workstream;
  export let acceptedApplication: Application | undefined = undefined;

  const estimates = workstreamsStore.estimates;
  $: estimate = $estimates.streams[workstream.id];

  $: enrichedWorkstream = $workstreamsStore[workstream.id];
  $: isOwner = workstream.creator === $walletStore.accounts[0];
  $: isReceiver = workstream.acceptedApplication === $walletStore.accounts[0];
</script>

<Card hoverable={false}>
  <div slot="top">
    <h3 style="margin-bottom: 1rem;">Active stream</h3>
    <div class="timerate">
      <div style="text-align: right;">
        {#if enrichedWorkstream.onChainData}
          <Rate
            ratePerSecond={enrichedWorkstream.onChainData.amtPerSec}
            total={workstream.total}
          />
        {/if}
      </div>
      <div>
        <p class="timeframe">Active since Jan 5, 2022</p>
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
        {#if isOwner}
          <Button
            on:click={() =>
              modal.show(TopUpModal, undefined, {
                enrichedWorkstream
              })}>Top up</Button
          >
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
