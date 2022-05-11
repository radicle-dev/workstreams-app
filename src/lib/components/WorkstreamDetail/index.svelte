<script lang="ts">
  import { dateFormat } from '$lib/utils/format';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

  import ApplicationList from './ApplicationList.svelte';
  import ActiveStream from './ActiveStream.svelte';
  import ApplyRow from './ApplyRow.svelte';
  import User from '$components/User.svelte';
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
      <ActiveStream {workstream} {acceptedApplication} />
    {:else if workstream.state === WorkstreamState.PENDING && acceptedApplication}
      <ApplicationList
        applications={[acceptedApplication]}
        title="Accepted applications"
        {workstream}
        {creator}
        accepted={creator}
      />
    {:else}
      <ApplyRow {workstream} {creator} {applied} />
    {/if}
    {#if workstream.state === WorkstreamState.RFA && openApplications?.length > 0}
      <ApplicationList
        applications={openApplications}
        title="Open applications"
        {creator}
        {workstream}
      />
    {/if}
    {#if rejectedApplications?.length > 0}
      <ApplicationList
        style="margin-top: 1.5rem;"
        applications={rejectedApplications}
        title="Rejected applications"
        {workstream}
      />
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

  .desc {
    margin-top: 2rem;
    color: var(--color-foreground);
    user-select: text;
  }
</style>
