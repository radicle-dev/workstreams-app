<script lang="ts">
  import { fade } from 'svelte/transition';

  import Card from '$lib/components/Card.svelte';
  import {
    workstreamsStore,
    type EnrichedWorkstream
  } from '$lib/stores/workstreams';
  import User from '$lib/components/User.svelte';
  import Rate from '$lib/components/Rate.svelte';
  import {
    Currency,
    WorkstreamState,
    type Workstream
  } from '$lib/stores/workstreams/types';
  import { currencyFormat } from '$lib/utils/format';
  import WorkstreamStateBadge from './WorkstreamStateBadge.svelte';

  const { estimates } = workstreamsStore;

  export let enrichedWorkstream: EnrichedWorkstream | undefined = undefined;
  export let workstream: Workstream | undefined = undefined;

  $: ws = enrichedWorkstream?.data || workstream;
  $: estimate = ws && $estimates.workstreams[ws.id];

  $: onChainDataReady = Boolean(estimate);

  $: lastStreamRate =
    ws &&
    (enrichedWorkstream?.onChainData?.dripHistory.find(
      (e) => e.amtPerSec.wei !== BigInt(0)
    )?.amtPerSec || { currency: Currency.DAI, wei: ws.ratePerSecond.wei });
</script>

{#if ws}
  <a sveltekit:prefetch href={`/workstream/${ws.id}`}>
    <Card>
      <div slot="top" class="content">
        <div class="name-and-users">
          <div class="name-and-state">
            <h3 class="name">{ws.title}</h3>
            {#if onChainDataReady && enrichedWorkstream}
              <div class="state-badge" transition:fade|local>
                <WorkstreamStateBadge {enrichedWorkstream} />
              </div>
            {/if}
          </div>
          <div class="user-row">
            <User address={ws.creator} />
            {#if ws.acceptedApplication}
              → <User address={ws.acceptedApplication} />
            {/if}
          </div>
        </div>
        <div class="stream-details">
          {#if lastStreamRate}<Rate
              ratePerSecond={lastStreamRate}
              total={ws.total}
            />{/if}
          {#if ws.state === WorkstreamState.ACTIVE && estimate}
            <div class="remaining" transition:fade|local>
              • <span class="amount"
                >{currencyFormat(estimate.remainingBalance)} DAI
              </span><span>remaining</span>
            </div>
          {/if}
        </div>
      </div>
    </Card>
  </a>
{/if}

<style>
  .content {
    min-height: 8rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
  }

  .name-and-state {
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-row {
    display: flex;
    gap: 0.5rem;
    color: var(--color-foreground-level-6);
    font-weight: 600;
  }

  .stream-details {
    color: var(--color-foreground-level-5);
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .amount {
    color: var(--color-primary);
    font-weight: 600;
  }

  .state-badge {
    flex-shrink: 0;
  }
</style>
