<script lang="ts">
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import type { Workstream } from '$lib/stores/workstreams/types';
  import * as modal from '$lib/utils/modal';

  import ApplyModal from '$components/ApplyModal.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import Apply from 'radicle-design-system/icons/Ledger.svelte';

  export let workstream: Workstream;
</script>

<div>
  <h4>{workstream.title}</h4>
  <Button
    disabled={$connectedAndLoggedIn &&
      $walletStore.connected &&
      workstream.applicants?.includes($walletStore.address)}
    icon={Apply}
    on:click={() => modal.show(ApplyModal, undefined, { workstream })}
    >Apply</Button
  >
</div>

<style>
  div {
    display: flex;
    align-items: center;
    height: 100%;
    justify-content: space-between;
  }
</style>
