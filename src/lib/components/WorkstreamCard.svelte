<script lang="ts">
  import { fade } from 'svelte/transition';

  import Card from '$lib/components/Card.svelte';
  import type { EnrichedWorkstream, Money } from '$lib/stores/workstreams';
  import User from '$lib/components/User.svelte';
  import Rate from '$lib/components/Rate.svelte';
  import { currencyFormat } from '$lib/utils/format';
  import WorkstreamStateBadge from './WorkstreamStateBadge.svelte';

  export let enrichedWorkstream: EnrichedWorkstream | undefined = undefined;

  $: ws = enrichedWorkstream?.data;
  $: estimate = enrichedWorkstream?.estimate;

  $: onChainDataReady = Boolean(estimate);

  $: lastStreamRate =
    ws &&
    (enrichedWorkstream?.onChainData?.dripHistory.find(
      (e) => e.amtPerSec.wei !== BigInt(0)
    )?.amtPerSec ??
      ({ currency: 'dai', wei: ws.amountPerSecond.wei } as Money));
</script>

{#if ws}
  <a sveltekit:prefetch href={`/workstream/${enrichedWorkstream?.cid}`}>
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
            → <User address={ws.receiver} />
          </div>
        </div>
        <div class="stream-details">
          {#if lastStreamRate}<Rate
              ratePerSecond={lastStreamRate}
              total={ws.streamTarget}
            />{/if}
          {#if enrichedWorkstream?.estimate}
            <div class="remaining" transition:fade|local>
              • <span class="amount"
                >{currencyFormat(enrichedWorkstream.estimate.remainingBalance)} DAI
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
