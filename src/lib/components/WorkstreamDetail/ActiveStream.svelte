<script lang="ts">
  import * as modal from '$lib/utils/modal';

  import Card from '$components/Card.svelte';
  import User from '$components/User.svelte';
  import Rate from '$components/Rate.svelte';
  import Row from '$components/Row.svelte';
  import ApplicationModal from '$components/ApplicationModal.svelte';
  import Pause from 'radicle-design-system/icons/Pause.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import type { Application, Workstream } from '$lib/stores/workstreams/types';

  export let workstream: Workstream;
  export let acceptedApplication: Application | undefined = undefined;
</script>

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
        <Button variant="primary-outline" icon={Pause}>Pause</Button>
        <Button>Top up</Button>
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
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
</style>
