<script lang="ts">
  import * as modal from '$lib/utils/modal';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

  import Card from '$components/Card.svelte';
  import TimeRate from '$components/TimeRate.svelte';
  import ApplyModal from '$components/ApplyModal.svelte';
  import Apply from 'radicle-design-system/icons/Ledger.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import Tooltip from 'radicle-design-system/Tooltip.svelte';
  import type { Workstream } from '$lib/stores/workstreams/types';

  export let workstream: Workstream;
  export let creator = false;
  export let applied = false;
</script>

<Card hoverable={false} style="margin-bottom: 1.5rem;">
  <div slot="top">
    <div class="timerate">
      <TimeRate {workstream} />
      {#if !creator}
        <Tooltip
          position="top"
          value={applied ? "You've already applied" : null}
        >
          <Button
            disabled={applied || !$connectedAndLoggedIn}
            icon={Apply}
            on:click={() => modal.show(ApplyModal, undefined, { workstream })}
          >
            Apply
          </Button>
        </Tooltip>
      {/if}
    </div>
  </div>
</Card>

<style>
  .timerate {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
  }
</style>
