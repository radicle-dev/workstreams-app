<script lang="ts">
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
    disabled={$walletStore.ready &&
      workstream.applicants?.includes($walletStore.accounts[0])}
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
