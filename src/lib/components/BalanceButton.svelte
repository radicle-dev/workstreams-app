<script lang="ts">
  import { fly } from 'svelte/transition';
  import Button from 'radicle-design-system/Button.svelte';
  import InfoCircle from 'radicle-design-system/icons/InfoCircle.svelte';

  import drips from '$lib/stores/drips';
  import { currencyFormat, padFloatString } from '$lib/utils/format';
  import { onMount } from 'svelte';
  import { workstreamsStore } from '$lib/stores/workstreams';

  const estimates = workstreamsStore.estimates;

  $: estimate =
    $estimates.totalBalance !== undefined &&
    currencyFormat($estimates.totalBalance);

  let withdrawable: string | undefined = undefined;
  let nextCycleStart: Date | undefined = undefined;

  onMount(async () => {
    withdrawable = currencyFormat(await drips.getCollectable());

    const cycleSecs = await (await drips.getCycleSecs()).toBigInt();
    const currentCycleSecs = BigInt(Math.floor(Date.now() / 1000)) % cycleSecs;
    const currentCycleStart = new Date(
      new Date().getTime() - Number(currentCycleSecs) * 1000
    );
    nextCycleStart = new Date(
      currentCycleStart.getTime() + Number(cycleSecs * BigInt(1000))
    );
  });

  let hover = false;
</script>

<div
  class="balance-button"
  on:mouseleave={() => (hover = false)}
  on:mouseenter={() => (hover = true)}
>
  <Button variant="outline">
    <span class="typo-text-mono">
      {#if estimate}
        {padFloatString(estimate)} DAI
      {:else}
        …
      {/if}
    </span>
  </Button>
  {#if hover}
    <div class="hover-pad" />
    <div in:fly={{ y: 10 }} out:fly={{ y: 10 }} class="dropdown">
      <div class="amounts">
        <div class="title-value withdrawable">
          <p class="typo-text title">Withdrawable</p>
          <h2 class="value">
            {#if withdrawable}
              {padFloatString(withdrawable)} DAI
            {:else}
              …
            {/if}
          </h2>
        </div>
        <div class="title-value balance">
          <p class="typo-text title">Current balance</p>
          <h2 class="value">
            {#if estimate}
              {padFloatString(estimate)} DAI
            {:else}
              …
            {/if}
          </h2>
        </div>
      </div>
      <div class="info">
        <InfoCircle />
        <p>
          While you’re earning in real-time, your withdrawable amount is updated
          once a week.
          {#if nextCycleStart}
            It will update next on {Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric'
            }).format(nextCycleStart)}
            at {Intl.DateTimeFormat('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }).format(nextCycleStart)}.
          {/if}
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .balance-button {
    width: fit-content;
    display: flex;
    position: relative;
    position: flex;
    flex-direction: column;
  }

  .hover-pad {
    position: absolute;
    top: 2rem;
    right: 0;
    width: 24rem;
    height: 1rem;
  }

  .dropdown {
    padding: 1rem;
    box-shadow: var(--elevation-high);
    position: absolute;
    top: 3rem;
    right: 0;
    width: 26rem;
    border-radius: 0.5rem;
    display: flex;
    gap: 1rem;
    flex-direction: column;
    z-index: 5;
    background-color: var(--color-background);
  }

  .amounts {
    display: flex;
    gap: 2rem;
  }

  .title {
    color: var(--color-foreground-level-6);
  }

  .value {
    font-family: var(--typeface-mono-bold);
  }

  .balance {
    color: var(--color-foreground-level-6);
  }

  .amounts > * {
    flex: 1;
  }

  .info {
    display: flex;
    gap: 0.5rem;
    color: var(--color-foreground-level-6);
  }
</style>
