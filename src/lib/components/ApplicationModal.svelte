<script lang="ts">
  import { currencyFormat } from '$lib/utils/format';
  import * as modal from '$lib/utils/modal';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import type { Workstream, Application } from '$lib/stores/workstreams/types';

  import Card from '$components/Card.svelte';
  import User from '$components/User.svelte';
  import TitleMeta from '$components/TitleMeta.svelte';
  import TimeRate from '$components/TimeRate.svelte';
  import Rate from '$components/Rate.svelte';
  import ThumbsDown from 'radicle-design-system/icons/ThumbsDown.svelte';
  import ThumbsUp from 'radicle-design-system/icons/ThumbsUp.svelte';
  import Button from 'radicle-design-system/Button.svelte';

  export let workstream: Workstream;
  export let application: Application;

  let actionsDisabled = false;
  let totalCounterOfferDifference = application.counterOffer
    ? application.counterOffer.rate * workstream.duration -
      workstream.payment.rate * workstream.duration
    : null;

  import Modal from '$components/Modal.svelte';
  import { getConfig } from '$lib/config';

  async function rejectApplication() {
    actionsDisabled = true;
    try {
      await fetch(
        `${getConfig().API_URL_BASE}/workstreams/${
          workstream.id
        }/applications/${application.id}/reject`,
        { method: 'POST', credentials: 'include' }
      );
    } catch (e) {
      return;
    } finally {
      actionsDisabled = false;
    }
    modal.hide();
  }

  async function acceptApplication() {
    actionsDisabled = true;
    try {
      await fetch(
        `${getConfig().API_URL_BASE}/workstreams/${
          workstream.id
        }/applications/${application.id}/accept`,
        { method: 'POST', credentials: 'include' }
      );
    } catch (e) {
      return;
    } finally {
      actionsDisabled = false;
    }
    modal.hide();
  }
</script>

<Modal>
  <div slot="body">
    <span class="emoji">👔</span>
    <h1>Workstream application</h1>
    <p class="applicant typo-text-bold">
      by <User address={application.creator} />
    </p>
    <div class="input-with-label">
      <h4>Applying to</h4>
      <Card style="width: 100%; margin-bottom: 2rem;" hoverable={false}>
        <div slot="top">
          <TitleMeta {workstream} />
        </div>
        <div slot="bottom">
          <TimeRate {workstream} />
        </div>
      </Card>
    </div>
    <div class="input-with-label">
      <h4>Application</h4>
      <Card
        style="width: 100%; margin-bottom: 2rem; text-align: left;"
        hoverable={false}
      >
        <div slot="top">
          <p style="user-select: text">{application.letter}</p>
        </div>
      </Card>
    </div>
    <div class="input-with-label">
      <h4>Proposed rate</h4>
      <Card style="width: 100%;" hoverable={false}>
        <div slot="top" class="proposal">
          {#if application.counterOffer}
            <Rate
              total={true}
              duration={workstream.duration}
              rate={application.counterOffer.rate}
              currency={application.counterOffer.currency}
            />
            <p class="typo-text-bold difference">
              {totalCounterOfferDifference > 0
                ? `+ ${currencyFormat(totalCounterOfferDifference)}`
                : `${currencyFormat(totalCounterOfferDifference)}`}
              {workstream.payment.currency.toUpperCase()}
              <span class="typo-text">in total</span>
            </p>
          {:else}
            <Rate
              total={true}
              duration={workstream.duration}
              rate={workstream.payment.rate}
              currency={workstream.payment.currency}
            />
          {/if}
        </div>
      </Card>
    </div>

    {#if $walletStore.connected && $walletStore.address === workstream.creator}
      <div class="actions">
        <Button
          disabled={actionsDisabled}
          on:click={rejectApplication}
          variant="destructive"
          icon={ThumbsDown}>Deny</Button
        >
        <Button
          disabled={actionsDisabled}
          on:click={acceptApplication}
          variant="primary"
          icon={ThumbsUp}>Accept</Button
        >
      </div>
    {/if}
  </div>
</Modal>

<style>
  h1::first-letter {
    text-transform: capitalize;
  }

  h1 {
    margin: 1rem 0;
    color: var(--color-foreground);
  }

  .applicant {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    justify-content: center;
    color: var(--color-foreground-level-6);
    margin-bottom: 3.5rem;
  }

  h4 {
    color: var(--color-foreground-level-6);
  }
  .emoji {
    font-size: 2rem;
  }

  .input-with-label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .proposal {
    display: flex;
    justify-content: space-between;
  }
  .difference {
    color: var(--color-foreground-level-5);
  }
  .actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
</style>
