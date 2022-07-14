<script lang="ts">
  import { fade } from 'svelte/transition';

  import Card from '../Card.svelte';
  import {
    workstreamsStore,
    type EnrichedWorkstream
  } from '$lib/stores/workstreams';
  import User from '../User.svelte';
  import Rate from '../Rate.svelte';
  import {
    Currency,
    WorkstreamState,
    type Workstream
  } from '$lib/stores/workstreams/types';
  import { currencyFormat } from '$lib/utils/format';
  import type { DripsReceiverStructOutput } from 'drips-sdk';

  const estimates = workstreamsStore.estimates;

  export let enrichedWorkstream: EnrichedWorkstream | undefined = undefined;
  export let workstream: Workstream | undefined = undefined;

  $: ws = enrichedWorkstream?.data || workstream;
  $: onChainData = enrichedWorkstream?.onChainData;
  $: estimate = $estimates.streams[ws.id];

  $: onChainDataReady = Boolean(estimate);

  /*
    Find the last update to the drips configuration that had an amount per second.
    This way, we can display the on-chain stream rate even if the stream is
    currently paused. If there is no such event on-chain, we fall back to the
    workstream's stored rate per second.
  */
  $: lastStreamRate =
    onChainData?.dripsUpdatedEvents
      .reduce<DripsReceiverStructOutput[]>(
        (prev, dew) => [...prev, ...dew.event.args.receivers],
        []
      )
      .filter((r) => r.receiver.toLowerCase() === ws.acceptedApplication)
      .find((r) => !r.amtPerSec.isZero())
      ?.amtPerSec?.toBigInt() || ws.ratePerSecond.wei;

  enum VisualState {
    /** Stream is set up and actively dripping */
    ACTIVE,
    /** Transaction to set up Drip is pending in Gnosis Safe */
    PENDING_CONFIRMATION,
    /** Stream is active, but no more balance is remaining in Drips account */
    OUT_OF_FUNDS,
    /** Stream was set up, but then paused by removing drip receiver */
    PAUSED,
    /** Stream marked as closed via API */
    CLOSED
  }

  let visualState: VisualState;

  $: visualStateText = {
    [VisualState.ACTIVE]: 'Active',
    [VisualState.PENDING_CONFIRMATION]: 'Pending confirmation',
    [VisualState.OUT_OF_FUNDS]: 'Out of funds',
    [VisualState.PAUSED]: 'Paused',
    [VisualState.CLOSED]: 'Closed'
  }[visualState];

  $: visualStateColor = {
    [VisualState.ACTIVE]: '--color-positive',
    [VisualState.OUT_OF_FUNDS]: '--color-negative',
    [VisualState.PAUSED]: '--color-caution',
    [VisualState.PENDING_CONFIRMATION]: '--color-caution',
    [VisualState.CLOSED]: '--color-foreground'
  }[visualState];

  $: {
    switch (ws.state) {
      case WorkstreamState.ACTIVE: {
        if (
          enrichedWorkstream?.onChainData &&
          !enrichedWorkstream.onChainData.streamSetUp
        ) {
          visualState = VisualState.PENDING_CONFIRMATION;
        } else if (estimate && !estimate.currentlyStreaming) {
          visualState = estimate.paused
            ? VisualState.PAUSED
            : VisualState.OUT_OF_FUNDS;
        } else {
          visualState = VisualState.ACTIVE;
        }
        break;
      }
      case WorkstreamState.CLOSED: {
        visualState = VisualState.CLOSED;
        break;
      }
    }
  }
</script>

<a sveltekit:prefetch href={`/workstream/${ws.id}`}>
  <Card>
    <div slot="top" class="content">
      <div class="name-and-users">
        <div class="name-and-state">
          <h3 class="name">{ws.title}</h3>
          {#if onChainDataReady}
            <div
              transition:fade|local
              class="state-badge"
              style={`background-color: var(${visualStateColor}-level-1`}
            >
              <span
                class="typo-text-bold"
                style={`color: var(${visualStateColor}-level-6`}
                >{visualStateText}</span
              >
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
        {#if ws.state === WorkstreamState.RFA}
          <Rate
            ratePerSecond={{ wei: lastStreamRate, currency: Currency.DAI }}
            total={ws.total}
            durationDays={ws.durationDays}
            showTotal
          />
        {:else}
          <Rate
            ratePerSecond={{ wei: lastStreamRate, currency: Currency.DAI }}
            total={ws.total}
          />
        {/if}
        {#if ws.state === WorkstreamState.ACTIVE && onChainDataReady}
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

  .state-badge {
    display: flex;
    align-items: center;
    height: 1.5rem;
    flex-shrink: 0;
    padding: 0.5rem;
    border-radius: 0.5rem;
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
</style>
