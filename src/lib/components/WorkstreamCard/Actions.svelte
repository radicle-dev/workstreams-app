<script lang="ts">
  import { getConfig } from '$lib/config';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';
  import * as modal from '$lib/utils/modal';

  import ActionRow from './ActionRow.svelte';
  import ApplicationModal from '$components/ApplicationModal.svelte';
  import SetUpPaymentModal from '../SetUpPaymentModal/SetUpPaymentModal.svelte';
  import type { EnrichedWorkstream } from '$lib/stores/workstreams/workstreams';
  import {
    WorkstreamState,
    type Application
  } from '$lib/stores/workstreams/types';
  import balanceEstimates from '$lib/stores/balanceEstimates';
  import { currencyFormat, padFloatString } from '$lib/utils/format';

  export let enrichedWorkstream: EnrichedWorkstream;

  let workstream = enrichedWorkstream.data;
  $: workstream = enrichedWorkstream.data;

  let creator: boolean =
    $connectedAndLoggedIn && workstream.creator === $walletStore.accounts[0];
  let assignee: boolean =
    $connectedAndLoggedIn &&
    workstream.acceptedApplication === $walletStore.accounts[0];
  let applicant: boolean =
    $connectedAndLoggedIn &&
    workstream.applicants?.includes($walletStore.accounts[0]);
  let rejectant: boolean =
    $connectedAndLoggedIn &&
    workstream.rejectedApplications?.includes($walletStore.accounts[0]);

  $: remainingBalance =
    workstream.state === WorkstreamState.ACTIVE &&
    $balanceEstimates.streams[workstream.id]?.remainingBalance;

  async function getApplication(id: string): Promise<Application | null> {
    const url = `${getConfig().API_URL_BASE}/workstreams/${
      workstream.id
    }/applications/${id}`;
    const response = await fetch(url, { credentials: 'include' });

    return response.ok && (await response.json());
  }
</script>

{#if creator}
  {#if workstream.state === WorkstreamState.ACTIVE && remainingBalance}
    <ActionRow
      leftString={`${padFloatString(
        currencyFormat(remainingBalance.wei)
      )} DAI left`}
    />
  {:else if workstream.applicationsToReview.length > 0}
    <ActionRow
      facePile={workstream.applicationsToReview}
      leftString={`${workstream.applicationsToReview.length} application${
        workstream.applicationsToReview.length > 1 ? `s` : ``
      } to review`}
    />
  {:else if workstream.acceptedApplication}
    <ActionRow
      userAddress={workstream.acceptedApplication}
      leftString="You've accepted an application"
      outlineActionText="Set up stream"
      on:outlineAction={() =>
        modal.show(SetUpPaymentModal, undefined, {
          workstream,
          application: getApplication(workstream.acceptedApplication)
        })}
    />
  {:else}
    <ActionRow
      leftString="Your workstream is waiting for applications"
      outlineActionText="Share"
      on:outlineAction={() => console.log('Share stream')}
    />
  {/if}
{:else if applicant}
  {#if workstream.state === WorkstreamState.ACTIVE && remainingBalance}
    <ActionRow
      leftString={`${padFloatString(
        currencyFormat(remainingBalance.wei)
      )} DAI left`}
    />
  {:else if rejectant}
    <ActionRow
      leftString="Your application is rejected."
      outlineActionText="View"
      on:outlineAction={() =>
        modal.show(ApplicationModal, undefined, {
          workstream,
          application: getApplication($walletStore.accounts[0])
        })}
    />
  {:else if assignee}
    <ActionRow
      leftString="Your application has been accepted"
      outlineActionText="View"
      on:outlineAction={() =>
        modal.show(ApplicationModal, undefined, {
          workstream,
          application: getApplication(workstream.acceptedApplication)
        })}
    />
  {:else}
    <ActionRow
      leftString="Your application is pending review."
      outlineActionText="View"
      on:outlineAction={() =>
        modal.show(ApplicationModal, undefined, {
          workstream,
          application: getApplication($walletStore.accounts[0])
        })}
    />
  {/if}
{/if}
