<script lang="ts">
  import { dateFormat } from '$lib/utils/format';
  import { getConfig } from '$lib/config';
  import * as modal from '$lib/utils/modal';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

  import Card from '$components/Card.svelte';
  import User from '$components/User.svelte';
  import Rate from '$components/Rate.svelte';
  import Row from '$components/Row.svelte';
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

  let acceptedApplication: Application | undefined = undefined;
  let openApplications: Application[] | undefined = undefined;
  let rejectedApplications: Application[] | undefined = undefined;

  let applied: boolean = false;
  let creator: boolean =
    $connectedAndLoggedIn && workstream.creator === $walletStore.accounts[0];

  let actionsDisabled = false;

  async function rejectApplication(id: string) {
    actionsDisabled = true;
    try {
      await fetch(
        `${getConfig().API_URL_BASE}/workstreams/${
          workstream.id
        }/applications/${id}/reject`,
        { method: 'POST', credentials: 'include' }
      );
    } catch (e) {
      return;
    } finally {
      actionsDisabled = false;
    }
  }

  $: {
    applied =
      $connectedAndLoggedIn &&
      workstream.applicants?.includes($walletStore.accounts[0]);
    if (applications) {
      acceptedApplication = applications.find(
        (application) => application.state === ApplicationState.ACCEPTED
      );
      openApplications = applications.filter(
        (application) => application.state === ApplicationState.WAITING
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
                ratePerSecond={workstream.ratePerSecond}
                total={workstream.total}
              />
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
              <p class="proposal">4020 DAI left (8.04 days)</p>
              <Button
                on:click={() =>
                  modal.show(ApplicationModal, undefined, {
                    workstream,
                    acceptedApplication
                  })}>View application</Button
              >
            </div>
          </Row>
          <div class="stream-actions">
            <p>5000 of 8000 DAI topped up</p>
            <div style="display: flex; gap: .75rem;">
              <Button variant="primary-outline" icon={Cross}>Pause</Button>
              <Button>Top up</Button>
            </div>
          </div>
        </div>
      </Card>
    {:else if workstream.state === WorkstreamState.PENDING && acceptedApplication}
      <Card hoverable={false}>
        <div slot="top">
          <h3>Accepted application</h3>
        </div>
        <div slot="bottom">
          <Row>
            <div slot="left">
              <User address={acceptedApplication.creator} />
            </div>
            <div slot="right" class="row-actions">
              {#if acceptedApplication.counterOffer}
                <p class="proposal">
                  Proposes <Rate
                    icon={false}
                    showTotal={true}
                    ratePerSecond={acceptedApplication.counterOffer
                      .ratePerSecond}
                    total={acceptedApplication.counterOffer.total}
                  />
                </p>
              {/if}
              <Button
                on:click={() =>
                  modal.show(ApplicationModal, undefined, {
                    workstream,
                    acceptedApplication
                  })}>View</Button
              >
            </div>
          </Row>
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
    {#if workstream.state === WorkstreamState.RFA && openApplications.length > 0}
      <Card hoverable={false}>
        <div slot="top">
          <h3>Open applications</h3>
        </div>
        <div slot="bottom">
          {#each openApplications as application}
            <Row>
              <div slot="left">
                <User address={application.creator} />
              </div>
              <div slot="right" class="row-actions">
                {#if application.counterOffer}
                  <p class="proposal">
                    Proposes <Rate
                      icon={false}
                      showTotal={true}
                      ratePerSecond={application.counterOffer.ratePerSecond}
                      total={application.counterOffer.total}
                    />
                  </p>
                {/if}
                {#if $connectedAndLoggedIn && $walletStore.connected && $walletStore.accounts[0] === workstream.creator}
                  <Button
                    disabled={actionsDisabled}
                    on:click={() => rejectApplication(application.id)}
                    variant="primary"
                    icon={ThumbsDown}>Deny</Button
                  >
                {/if}
                <Button
                  on:click={() =>
                    modal.show(ApplicationModal, undefined, {
                      workstream,
                      application
                    })}>View</Button
                >
              </div>
            </Row>
          {/each}
        </div>
      </Card>
    {/if}
    {#if rejectedApplications.length > 0}
      <Card hoverable={false} style="margin-top: 1rem;">
        <div slot="top">
          <h3>Rejected applications</h3>
        </div>
        <div slot="bottom">
          {#each rejectedApplications as application}
            <Row>
              <div slot="left">
                <User address={application.creator} />
              </div>
              <div slot="right" class="row-actions">
                {#if application.counterOffer}
                  <p class="proposal">Rejected</p>
                {/if}
                <Button
                  on:click={() =>
                    modal.show(ApplicationModal, undefined, {
                      workstream,
                      application
                    })}>View</Button
                >
              </div>
            </Row>
          {/each}
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
