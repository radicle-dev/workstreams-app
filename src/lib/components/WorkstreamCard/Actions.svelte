<script lang="ts">
  import { getConfig } from '$lib/config';
  import type { Workstream, Application } from '$lib/stores/workstreams/types';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';
  import * as modal from '$lib/utils/modal';

  import Button from 'radicle-design-system/Button.svelte';
  import ActionRow from '$components/ActionRow.svelte';
  import User from '$components/User.svelte';
  import FacePile from '$components/FacePile.svelte';
  import ApplicationModal from '$components/ApplicationModal.svelte';

  export let workstream: Workstream;

  let creator: boolean =
    $connectedAndLoggedIn && workstream.creator === $walletStore.accounts[0];
  let assignee: boolean =
    $connectedAndLoggedIn &&
    workstream.acceptedApplication === $walletStore.accounts[0];
  let applicant: boolean =
    $connectedAndLoggedIn &&
    workstream.applicants &&
    workstream.applicants.includes($walletStore.accounts[0]);

  async function getApplication(id: string): Promise<Application | null> {
    const url = `${getConfig().API_URL_BASE}/workstreams/${
      workstream.id
    }/applications/${id}`;
    const response = await fetch(url, { credentials: 'include' });

    return response.ok && (await response.json());
  }
</script>

{#if creator}
  {#if workstream.applicationsToReview.length > 0}
    <ActionRow>
      <div slot="left" class="left">
        <FacePile addresses={workstream.applicationsToReview} />
        <p>
          {workstream.applicationsToReview.length} pending application{workstream
            .applicationsToReview.length > 1
            ? `s`
            : ``}
        </p>
      </div>
    </ActionRow>
  {:else if workstream.acceptedApplication}
    <ActionRow>
      <div slot="left" class="left">
        <User address={workstream.acceptedApplication} showAddress={false} />
        <p>You've accepted an application</p>
      </div>
      <div slot="right" class="right">
        <Button variant="primary-outline">Set up stream</Button>
      </div>
    </ActionRow>
  {:else}
    <ActionRow>
      <div slot="left" class="left">
        <p>Your workstream is waiting for applications</p>
      </div>
      <div slot="right" class="right">
        <Button variant="primary-outline">Share</Button>
      </div>
    </ActionRow>
  {/if}
{:else if applicant}
  {#if assignee}
    <ActionRow>
      <div slot="left" class="left">
        <p>Your application has been accepted</p>
      </div>
      <div slot="right" class="right">
        <Button
          variant="primary-outline"
          on:click={() =>
            modal.show(ApplicationModal, undefined, {
              workstream,
              application: getApplication(workstream.acceptedApplication)
            })}>View</Button
        >
      </div>
    </ActionRow>
  {:else}
    <ActionRow>
      <div slot="left" class="left">
        <p>Your application is pending review.</p>
      </div>
      <div slot="right" class="right">
        <Button
          variant="primary-outline"
          on:click={() =>
            modal.show(ApplicationModal, undefined, {
              workstream,
              application: getApplication($walletStore.accounts[0])
            })}>View</Button
        >
      </div>
    </ActionRow>
  {/if}
{/if}

<style>
  .left,
  .right {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .right {
    color: var(--color-primary);
  }
</style>
