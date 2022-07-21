<script lang="ts">
  import { goto } from '$app/navigation';
  import cupertinoPane from '$lib/stores/cupertinoPane';

  import ensNames from '$lib/stores/ensNames';
  import clearStores from '$lib/stores/utils/clearStores';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import { workstreamsStore } from '$lib/stores/workstreams';
  import { currencyFormat } from '$lib/utils/format';
  import Button from 'radicle-design-system/Button.svelte';

  import Road from 'radicle-design-system/icons/Road.svelte';
  import Topup from 'radicle-design-system/icons/Topup.svelte';
  import Avatar from '../Avatar.svelte';

  import AccountSheetItem from './components/AccountSheetItem.svelte';

  const estimates = workstreamsStore.estimates;

  $: estimate =
    $estimates.totalBalance !== undefined &&
    currencyFormat($estimates.totalBalance);

  async function logOut() {
    await walletStore.disconnect();
    clearStores();
  }

  async function closeAnd(fn: () => void) {
    cupertinoPane.closeSheet();
    fn();
  }
</script>

<div class="items">
  <AccountSheetItem title={$ensNames[$walletStore.address]?.name || '...'}>
    <Avatar slot="left" address={$walletStore.address} rem={3} />
    <Button variant="outline" slot="right" on:click={() => closeAnd(logOut)}
      >Sign out</Button
    >
  </AccountSheetItem>
  <div class="divider" />
  <AccountSheetItem
    title="Withdraw funds"
    subtitle={estimate && `Earned ${estimate} DAI in total`}
    icon={Topup}
  />
  <AccountSheetItem
    title="View account history"
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
