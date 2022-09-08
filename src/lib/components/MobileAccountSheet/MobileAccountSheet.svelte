<script lang="ts">
  import Button from 'radicle-design-system/Button.svelte';
  import Road from 'radicle-design-system/icons/Road.svelte';
  import Topup from 'radicle-design-system/icons/Topup.svelte';

  import * as modal from '$lib/utils/modal';
  import { goto } from '$app/navigation';
  import cupertinoPane from '$lib/stores/cupertinoPane';
  import drips from '$lib/stores/drips';
  import ensNames from '$lib/stores/ensNames';
  import clearStores from '$lib/stores/utils/clearStores';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import { workstreamsStore } from '$lib/stores/workstreams';
  import { currencyFormat, formatAddress } from '$lib/utils/format';
  import Avatar from '$lib/components/Avatar.svelte';
  import StepperModal from '$lib/components/StepperModal/index.svelte';
  import Intro from '$lib/components/WithdrawSteps/Intro.svelte';
  import AccountSheetItem from './components/AccountSheetItem.svelte';
  import AwaitingSafeTransactionStep from '$lib/components/AwaitingSafeTransactionStep.svelte';

  const estimates = workstreamsStore.estimates;

  $: estimate =
    $estimates.totalBalance && currencyFormat($estimates.totalBalance);

  $: withdrawable = $drips.collectable && currencyFormat($drips.collectable);

  $: address = $walletStore.address;

  async function logOut() {
    await walletStore.disconnect();
    clearStores();
  }

  async function closeAnd(fn: () => void) {
    cupertinoPane.closeSheet();
    fn();
  }

  function openWithdrawModal() {
    modal.show(StepperModal, undefined, {
      steps: [Intro, $walletStore.safe?.ready && AwaitingSafeTransactionStep]
    });
  }
</script>

<div class="items">
  <AccountSheetItem
    title={(address && $ensNames[address]?.name) ??
      (address && formatAddress(address)) ??
      '...'}
  >
    <div slot="left">
      {#if address}<Avatar {address} rem={3} />{/if}
    </div>
    <Button variant="outline" slot="right" on:click={() => closeAnd(logOut)}
      >Sign out</Button
    >
  </AccountSheetItem>
  <div class="divider" />
  <AccountSheetItem
    title="Withdraw funds"
    disabled={!withdrawable || withdrawable === '0'}
    subtitle={withdrawable && `${withdrawable} DAI withdrawable now`}
    icon={Topup}
    onClick={() => closeAnd(openWithdrawModal)}
  />
  <AccountSheetItem
    title="View account history"
    subtitle={estimate && `Earned ${estimate} DAI in total`}
    icon={Road}
    onClick={() => closeAnd(() => goto('/history'))}
  />
  <div class="divider" />
  <p class="credits typo-text-small">
    Built by <a href="radicle.network" target="_blank">Radicle</a> • Powered by
    <a href="drips.network" target="_blank">Radicle Drips</a>
  </p>
</div>

<style>
  .items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .divider {
    height: 0.125rem;
    background-color: var(--color-foreground-level-2);
    border-radius: 0.0625rem;
  }

  .credits {
    color: var(--color-foreground-level-5);
    margin-bottom: 1rem;
  }

  .credits a {
    text-decoration: underline;
  }
</style>
