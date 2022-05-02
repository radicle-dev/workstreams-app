<script lang="ts">
  import { goto, prefetch } from '$app/navigation';
  import { hyphenateString } from '$lib/utils/format';
  import type { Workstream } from '$lib/stores/workstreams/types';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';
  import * as modal from '$lib/utils/modal';

  import Card from '$components/Card.svelte';
  import ApplyModal from '$components/ApplyModal.svelte';
  import TitleMeta from '$components/TitleMeta.svelte';
  import TimeRate from '$components/TimeRate.svelte';
  import ActionRow from '$components/ActionRow.svelte';
  import Apply from 'radicle-design-system/icons/Ledger.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import Tooltip from 'radicle-design-system/Tooltip.svelte';

  export let workstream: Workstream;

  let applied: boolean =
    $connectedAndLoggedIn &&
    $walletStore.connected &&
    workstream.applicants?.includes($walletStore.address);

  $: url = `/workstream/${hyphenateString(workstream.id)}`;
</script>

<Card
  style="height: 14.125rem"
  on:click={() => goto(url)}
  on:hover={() => prefetch(url)}
>
  <div slot="top">
    <TitleMeta {workstream} />
  </div>
  <div slot="bottom">
    <TimeRate {workstream} />
    {#if workstream.applicants && !applied}
      <ActionRow>
        <div slot="left">
          {workstream.applicants.length} application{workstream.applicants
            .length === 1
            ? ''
            : 's'}
        </div>
        <div slot="right">
          <Button
            variant="primary-outline"
            icon={Apply}
            on:click={() => modal.show(ApplyModal, undefined, { workstream })}
          >
            Apply
          </Button>
        </div>
      </ActionRow>
    {:else if applied}
      <ActionRow>
        <div slot="left">You've applied</div>
      </ActionRow>
    {/if}
  </div>
</Card>
