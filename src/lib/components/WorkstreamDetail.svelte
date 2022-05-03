<script lang="ts">
  import { dateFormat } from '$lib/utils/format';
  import * as modal from '$lib/utils/modal';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

  import Card from '$components/Card.svelte';
  import User from '$components/User.svelte';
  import Rate from '$components/Rate.svelte';
  import ActionRow from '$components/ActionRow.svelte';
  import TimeRate from '$components/TimeRate.svelte';
  import ApplyModal from '$components/ApplyModal.svelte';
  import ApplicationModal from '$components/ApplicationModal.svelte';
  import Apply from 'radicle-design-system/icons/Ledger.svelte';
  import Cross from 'radicle-design-system/icons/Cross.svelte';
  import ThumbsDown from 'radicle-design-system/icons/ThumbsDown.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import Tooltip from 'radicle-design-system/Tooltip.svelte';
  import Markdown from 'radicle-design-system/Markdown.svelte';
  import {
    WorkstreamState,
    ApplicationState,
    type Application,
    type Workstream
  } from '$lib/stores/workstreams/types';

  export let workstream: Workstream;
  export let applications: Application[] | undefined = undefined;

  let activeApplication: Application | undefined = undefined;
  let rejectedApplications: Application[] | undefined = undefined;

  let applied: boolean =
    $connectedAndLoggedIn &&
    workstream.applicants?.includes($walletStore.accounts[0]);
  let creator: boolean =
    $connectedAndLoggedIn && workstream.creator === $walletStore.accounts[0];

  $: {
    if (workstream.state === WorkstreamState.ACTIVE) {
      activeApplication = applications.find(
        (application) => application.state === ApplicationState.ACCEPTED
      );
      rejectedApplications = applications.filter(
        (application) => application.state === ApplicationState.REJECTED
      );
    }
  }
</script>

<div class="container">
  <div class="metadata">
    <h1 style="margin-bottom: 0.75rem;">{workstream.title}</h1>
    <div class="owner">
      <span class="label">created by</span>
      <User address={workstream.creator} />
      <span class="label" style="margin-left: 0.5rem;"
        >on {dateFormat(workstream.created_at)}</span
      >
    </div>
    {#if workstream.state === WorkstreamState.ACTIVE}
      <Card hoverable={false}>
        <div slot="top">
          <h3 style="margin-bottom: 1rem;">Active stream</h3>
          <div class="timerate">
            <div style="text-align: right;">
              <Rate
                rate={workstream.payment.rate}
                currency={workstream.payment.currency}
              />
            </div>
            <div>
              <p class="timeframe">Active since Jan 5, 2022</p>
            </div>
          </div>
        </div>
        <div slot="bottom">
          <ActionRow>
            <div slot="left">
              <User address={activeApplication.creator} />
            </div>
            <div slot="right" class="row-actions">
              <p class="proposal">4020 DAI left (8.04 days)</p>
              <Button
                on:click={() =>
                  modal.show(ApplicationModal, undefined, {
                    workstream,
                    activeApplication
                  })}>View application</Button
              >
            </div>
          </ActionRow>
          <div class="stream-actions">
            <p>5000 of 8000 DAI topped up</p>
            <div style="display: flex; gap: .75rem;">
              <Button variant="primary-outline" icon={Cross}>Pause</Button>
              <Button>Top up</Button>
            </div>
          </div>
        </div>
      </Card>
      <Card hoverable={false} style="margin-top: 1rem;">
        <div slot="top">
          <h3>Rejected applications</h3>
        </div>
        <div slot="bottom">
          {#if rejectedApplications}
            {#each rejectedApplications as application}
              <ActionRow>
                <div slot="left">
                  <User address={application.creator} />
                </div>
                <div slot="right" class="row-actions">
                  {#if application.counterOffer}
                    <p class="proposal">Rejected</p>
                  {/if}
                  {#if $connectedAndLoggedIn && $walletStore.accounts[0] === workstream.creator}
                    <Button variant="primary" icon={ThumbsDown}>Deny</Button>
                  {/if}
                  <Button
                    on:click={() =>
                      modal.show(ApplicationModal, undefined, {
                        workstream,
                        application
                      })}>View</Button
                  >
                </div>
              </ActionRow>
            {/each}
          {/if}
        </div>
      </Card>
    {:else}
      <Card hoverable={false} style="margin-bottom: 1.5rem;">
        <div slot="top">
          <div class="timerate">
            <TimeRate {workstream} />
            {#if !creator}
              <Tooltip value={applied ? "You've already applied" : null}>
                <Button
                  disabled={applied || !$connectedAndLoggedIn}
                  icon={Apply}
                  on:click={() =>
                    modal.show(ApplyModal, undefined, { workstream })}
                >
                  Apply
                </Button>
              </Tooltip>
            {/if}
          </div>
        </div>
      </Card>
    {/if}
    {#if workstream.state === WorkstreamState.RFA && applications.length > 0}
      <Card hoverable={false}>
        <div slot="top">
          <h3>Open applications</h3>
        </div>
        <div slot="bottom">
          {#if applications}
            {#each applications as application}
              <ActionRow>
                <div slot="left">
                  <User address={application.creator} />
                </div>
                <div slot="right" class="row-actions">
                  {#if application.counterOffer}
                    <p class="proposal">
                      Proposes <Rate
                        icon={false}
                        total={true}
                        rate={application.counterOffer.rate}
                        currency={application.counterOffer.currency}
                        duration={workstream.duration}
                      />
                    </p>
                  {/if}
                  {#if $connectedAndLoggedIn && $walletStore.connected && $walletStore.accounts[0] === workstream.creator}
                    <Button variant="primary" icon={ThumbsDown}>Deny</Button>
                  {/if}
                  <Button
                    on:click={() =>
                      modal.show(ApplicationModal, undefined, {
                        workstream,
                        application
                      })}>View</Button
                  >
                </div>
              </ActionRow>
            {/each}
          {/if}
        </div>
      </Card>
    {/if}
    <div>
      <div class="desc">
        <Markdown content={workstream.desc} />
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 54rem;
    margin: 4rem auto;
    width: 100%;
  }
  .metadata > * {
    margin-bottom: 2rem;
  }
  .owner {
    display: flex;
    align-items: center;
  }

  .owner > span {
    margin-right: 0.5rem;
  }

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
  .desc {
    margin-top: 2rem;
    color: var(--color-foreground);
    user-select: text;
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
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
</style>
