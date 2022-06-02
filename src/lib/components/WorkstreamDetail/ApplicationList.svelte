<script lang="ts">
  import * as modal from '$lib/utils/modal';
  import { getConfig } from '$lib/config';

  import ApplicationModal from '$components/ApplicationModal.svelte';
  import Card from '$components/Card.svelte';
  import User from '$components/User.svelte';
  import Row from '$components/Row.svelte';
  import Rate from '$components/Rate.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import ThumbsDown from 'radicle-design-system/icons/ThumbsDown.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';

  import {
    ApplicationState,
    type Application,
    type Workstream
  } from '$lib/stores/workstreams/types';
  import StepperModal from '../StepperModal/index.svelte';
  import Intro from '../SetUpPaymentModal/steps/Intro.svelte';
  import SetDaiAllowance from '../SetUpPaymentModal/steps/SetDaiAllowance.svelte';
  import ConfirmValues from '../SetUpPaymentModal/steps/ConfirmValues.svelte';

  export let workstream: Workstream;
  export let applications: Application[];
  export let style = '';
  export let title = '';
  export let creator: boolean | undefined = undefined;
  export let accepted: boolean | undefined = undefined;

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
</script>

<Card hoverable={false} {style}>
  <div slot="top">
    <h3>{title}</h3>
  </div>
  <div slot="bottom">
    {#each applications as application}
      <Row>
        <div slot="left">
          <User address={application.creator} />
        </div>
        <div slot="right" class="row-actions">
          {#if application.state === ApplicationState.REJECTED}
            <p class="proposal">Rejected</p>
          {:else if application.state === ApplicationState.WAITING}
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
          {/if}
          {#if creator && !accepted}
            <Button
              disabled={actionsDisabled}
              on:click={() => rejectApplication(application.id)}
              variant="primary-outline"
              icon={ThumbsDown}>Deny</Button
            >
          {:else if accepted}
            <Button
              disabled={actionsDisabled}
              on:click={() =>
                modal.show(StepperModal, undefined, {
                  stepProps: {
                    workstream,
                    application
                  },
                  steps: [Intro, SetDaiAllowance, ConfirmValues]
                })}
              variant="primary-outline"
              icon={TokenStreams}>Set up stream</Button
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
</style>
