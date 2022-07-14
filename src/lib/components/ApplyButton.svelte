<script lang="ts">
  import * as modal from '$lib/utils/modal';

  import Button from 'radicle-design-system/Button.svelte';
  import ApplyIcon from 'radicle-design-system/icons/Ledger.svelte';

  import type { Workstream } from '$lib/stores/workstreams/types';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import ApplyModal from './ApplyModal.svelte';
  import Tooltip from 'radicle-design-system/Tooltip.svelte';

  export let workstream: Workstream;
  export let tooltipPosition: 'bottom' | 'left' | 'right' | 'top' = 'top';

  $: address = $walletStore.ready && $walletStore.address;
  $: isCreator = address && address === workstream.creator;
  $: isApplied = address && workstream.applicants?.includes(address);

  $: canApply = address && !isCreator && !isApplied;

  let tooltipValue: string | null = null;
  $: {
    if (isApplied) {
      tooltipValue = "You've already applied";
    } else if (isCreator) {
      tooltipValue = "You can't apply to your own workstream";
    } else if (!address) {
      tooltipValue = 'You must be logged in to apply';
    } else {
      tooltipValue = null;
    }
  }
</script>

<Tooltip position={tooltipPosition} value={tooltipValue}>
  <Button
    icon={ApplyIcon}
    disabled={!canApply}
    on:click={() => modal.show(ApplyModal, undefined, { workstream })}
  >
    Apply
  </Button>
</Tooltip>
