<script lang="ts">
  import { goto, prefetch } from '$app/navigation';
  import { hyphenateString } from '$lib/utils/format';
  import type { Workstream } from '$lib/stores/workstreams/types';
  import * as modal from '$lib/utils/modal';

  import Card from '$components/Card.svelte';
  import Apply from 'radicle-design-system/icons/Ledger.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import TitleMeta from '$components/TitleMeta.svelte';
  import Rate from '$components/Rate.svelte';
  import Timeframe from '$components/Timeframe.svelte';
  import ApplyModal from '$components/ApplyModal.svelte';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

  export let workstream: Workstream;

  $: url = `/workstream/${hyphenateString(workstream.id)}`;
</script>

<Card on:click={() => goto(url)} on:hover={() => prefetch(url)}>
  <div slot="top">
    <TitleMeta title={workstream.title} creator={workstream.creator} />
  </div>
  <div slot="bottom" class="spread">
    <div>
      <Timeframe duration={workstream.duration} />
      <Rate
        rate={workstream.payment.rate}
        currency={workstream.payment.currency}
      />
    </div>
    <Button
      variant="outline"
      icon={Apply}
      disabled={!(
        $connectedAndLoggedIn &&
        $walletStore.connected &&
        !workstream.applicants?.includes($walletStore.address)
      )}
      on:click={() => modal.show(ApplyModal, undefined, { workstream })}
    >
      Apply
    </Button>
  </div>
</Card>

<style>
  .spread {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: flex-end;
  }
</style>
