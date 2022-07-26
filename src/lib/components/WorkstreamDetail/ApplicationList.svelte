<script lang="ts">
  import Button from 'radicle-design-system/Button.svelte';
  import CheckCircle from 'radicle-design-system/icons/CheckCircle.svelte';
  import Cross from 'radicle-design-system/icons/Cross.svelte';

  import * as modal from '$lib/utils/modal';

  import ApplicationModal from '$components/ApplicationModal.svelte';
  import Card from '$components/Card.svelte';
  import User from '$components/User.svelte';
  import Row from '$components/Row.svelte';
  import Rate from '$components/Rate.svelte';

  import {
    ApplicationState,
    type Application,
    type Workstream
  } from '$lib/stores/workstreams/types';

  export let workstream: Workstream;
  export let applications: Application[];
  export let style = '';
  export let title = '';

  $: sortedApplications = applications.sort((a) => {
    if (a.state === ApplicationState.REJECTED) {
      return 1;
    } else if (a.state === ApplicationState.ACCEPTED) {
      return -1;
    } else {
      return -1;
    }
  });

  const applicationColorMap = {
    [ApplicationState.WAITING]: 'var(--color-primary-level-1)',
    [ApplicationState.ACCEPTED]: 'var(--color-positive-level-1)',
    [ApplicationState.REJECTED]: 'var(--color-negative-level-1)'
  };
</script>

<Card hoverable={false} {style}>
  <div slot="top">
    <h3>{title}</h3>
  </div>
  <div slot="bottom">
    {#each sortedApplications as application}
      <Row color={applicationColorMap[application.state]}>
        <div slot="left" class="user">
          <User address={application.creator} />
          {#if application.state === ApplicationState.ACCEPTED}
            <CheckCircle style="fill: var(--color-positive)" />
          {:else if application.state === ApplicationState.REJECTED}
            <Cross style="fill: var(--color-negative)" />
          {/if}
        </div>
        <div slot="right" class="row-actions">
          {#if application.state === ApplicationState.WAITING}
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
          <Button
            variant="outline"
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
  .user {
    display: flex;
    gap: 0.5rem;
    align-items: center;
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

  @media only screen and (max-width: 54rem) {
    .proposal {
      display: none;
    }
  }
</style>
