<script lang="ts">
  import {
    type StreamStart,
    HistoryItemType,
    type StreamOutOfFunds,
    type StreamPaused,
    type StreamToppedUp,
    type History,
    type StreamUnpaused
  } from './types';

  import { walletStore } from '$lib/stores/wallet/wallet';
  import {
    workstreamsStore,
    type DrippingEventWrapper,
    type EnrichedWorkstream
  } from '$lib/stores/workstreams';
  import HistoryItem from '$lib/components/History/HistoryItem.svelte';
  import { Currency, type Money } from '$lib/stores/workstreams/types';

  $: relevantStreams = Object.entries($workstreamsStore).filter(
    ([_, ws]) => ws.onChainData
  );

  let history: History;

  $: {
    const streamStartItems: StreamStart[] = relevantStreams.map(([_, ws]) => {
      const timestamp = new Date(
        ws.onChainData.dripsUpdatedEvents[0].fromBlock.timestamp * 1000
      );

      return {
        type: HistoryItemType.StreamStart,
        timestamp,
        meta: {
          workstream: ws
        }
      };
    });

    type StreamStartStopAggregation = {
      outOfFunds: StreamOutOfFunds[];
      toppedUp: StreamToppedUp[];
    };
    const streamStartStopAggregationItems: StreamStartStopAggregation =
      relevantStreams.reduce<StreamStartStopAggregation>(
        (acc, [_, ws]) => {
          const events = ws.onChainData.dripsUpdatedEvents;

          let newOutOfFundsItems = [];
          let newToppedUpItems = [];

          events.forEach((wrapper, index) => {
            const { event, fromBlock } = wrapper;
            const { receivers, balance } = event.args;

            const amtPerSec = receivers.reduce<bigint>(
              (acc, r) => acc + r.amtPerSec.toBigInt(),
              BigInt(0)
            );

            if (!amtPerSec) {
              return acc;
            }

            const nextEvent = events[index + 1];
            const streamingUntil =
              fromBlock.timestamp + Number(balance.toBigInt() / amtPerSec);
            const nextTimestamp =
              nextEvent?.fromBlock.timestamp || new Date().getTime() / 1000;

            if (streamingUntil > nextTimestamp) {
              return acc;
            }

            newOutOfFundsItems = [
              ...newOutOfFundsItems,
              {
                type: HistoryItemType.StreamOutOfFunds,
                timestamp: new Date(streamingUntil * 1000),
                meta: {
                  workstream: ws
                }
              }
            ];

            const wasToppedUpAfter =
              nextEvent &&
              nextEvent.event.args.balance.toBigInt() !== BigInt(0);

            newToppedUpItems = wasToppedUpAfter
              ? [
                  ...newToppedUpItems,
                  {
                    type: HistoryItemType.StreamToppedUp,
                    timestamp: new Date(nextEvent.fromBlock.timestamp * 1000),
                    meta: {
                      workstream: ws
                    }
                  }
                ]
              : newToppedUpItems;
          });

          return {
            outOfFunds: [...acc.outOfFunds, ...newOutOfFundsItems],
            toppedUp: [...acc.toppedUp, ...newToppedUpItems]
          };
        },
        { outOfFunds: [], toppedUp: [] }
      );

    const streamPausedItems: StreamPaused[] = relevantStreams.reduce<
      StreamPaused[]
    >((acc, [_, ws]) => {
      const events = ws.onChainData.dripsUpdatedEvents;

      // Get all updates that remove the drip to the recipient
      const pauses = events.filter(
        (dew) =>
          !dew.event.args.receivers.find(
            (r) => r.receiver.toLowerCase() === $walletStore.accounts[0]
          )
      );

      return [
        ...acc,
        ...pauses.map(
          (dew) =>
            ({
              type: HistoryItemType.StreamPaused,
              timestamp: new Date(dew.fromBlock.timestamp * 1000),
              meta: {
                workstream: ws
              }
            } as StreamPaused)
        )
      ];
    }, []);

    const streamUnpausedEvents: StreamUnpaused[] = relevantStreams.reduce<
      StreamUnpaused[]
    >((acc, [wsId, ws]) => {
      const events = ws.onChainData.dripsUpdatedEvents;

      // Get all updates that remove the drip to the recipient
      const unpauses = events.filter((dew, index) => {
        const prevDew: DrippingEventWrapper = events[index - 1];

        const prevDewPaused =
          prevDew &&
          !prevDew.event.args.receivers.find(
            (r) => r.receiver.toLowerCase() === $walletStore.accounts[0]
          );

        return (
          prevDewPaused &&
          dew.event.args.receivers.find(
            (r) => r.receiver.toLowerCase() === $walletStore.accounts[0]
          )
        );
      });

      return [
        ...acc,
        ...unpauses.map(
          (dew) =>
            ({
              type: HistoryItemType.StreamUnpaused,
              timestamp: new Date(dew.fromBlock.timestamp * 1000),
              meta: {
                workstream: ws
              }
            } as StreamUnpaused)
        )
      ];
    }, []);

    const allItems: History = [
      ...streamStartItems,
      ...streamStartStopAggregationItems.outOfFunds,
      ...streamStartStopAggregationItems.toppedUp,
      ...streamPausedItems,
      ...streamUnpausedEvents
      // Sort all aggregated history items by timestamp
    ].sort((a, b) => {
      if (a.timestamp < b.timestamp) {
        return 1;
      }
      if (a.timestamp > b.timestamp) {
        return -1;
      }
      return 0;
    });

    allItems.forEach((item, index) => {
      const prevItem = allItems[index + 1];

      const { timestamp } = item;
      const prevTimestamp = prevItem?.timestamp || new Date();

      const window = {
        to: timestamp.getTime() / 1000,
        from: prevTimestamp.getTime() / 1000
      };

      let amountsEarned: { workstream: EnrichedWorkstream; amount: Money }[] =
        [];

      for (const [_, stream] of relevantStreams) {
        const events = stream.onChainData.dripsUpdatedEvents;

        let amountEarned = BigInt(0);

        events.forEach((dew, index) => {
          const nextDew = events[index + 1];
          const validSince = dew.fromBlock.timestamp;
          const validUntil =
            nextDew?.fromBlock.timestamp || new Date().getTime() / 1000;
          const amtPerSec =
            dew.event.args.receivers[0]?.amtPerSec.toBigInt() || BigInt(0);

          if (amtPerSec === BigInt(0)) return;

          const toppedUpUntil =
            validSince + Number(dew.event.args.balance.toBigInt() / amtPerSec);

          const relevantWindow = {
            from: Math.max(validSince, window.from),
            to: Math.min(window.to, validUntil, toppedUpUntil)
          };

          const secondsInWindow = Math.max(
            relevantWindow.to - relevantWindow.from,
            0
          );
          amountEarned = amountEarned + BigInt(secondsInWindow) * amtPerSec;
        });

        if (amountEarned) {
          amountsEarned.push({
            workstream: stream,
            amount: {
              currency: Currency.DAI,
              wei: amountEarned
            }
          });
        }
      }

      if (amountsEarned.length > 0) {
        allItems.push({
          type: HistoryItemType.EarnedInbetween,
          timestamp: new Date(item.timestamp.getTime() - 1),
          meta: {
            earned: amountsEarned,
            total: {
              currency: Currency.DAI,
              wei: amountsEarned.reduce<bigint>(
                (acc, v) => acc + v.amount.wei,
                BigInt(0)
              )
            },
            secs: window.to - window.from,
            window: {
              from: new Date(window.from * 1000),
              to: new Date(window.to * 1000)
            }
          }
        });
      }
    });

    history = allItems.sort((a, b) => {
      if (a.timestamp < b.timestamp) {
        return 1;
      }
      if (a.timestamp > b.timestamp) {
        return -1;
      }
      return 0;
    });
  }
</script>

<template>
  {#if history}
    <div class="history">
      {#each history as historyItem}
        <HistoryItem {historyItem} />
      {/each}
    </div>
  {/if}
</template>

<style>
  .history {
    flex-direction: column;
    display: flex;
  }
</style>
