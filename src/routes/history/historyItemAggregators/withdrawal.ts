import drips from '$lib/stores/drips';
import { walletStore } from '$lib/stores/wallet/wallet';
import { Currency } from '$lib/stores/workstreams/types';
import { get } from 'svelte/store';
import type { HistoryAggregator } from '../history';
import { HistoryItemType } from '../types';

export const withdrawal: HistoryAggregator = () =>
  get(drips).collectHistory?.map((w) => ({
    type: HistoryItemType.Withdrawal,
    timestamp: new Date(w.fromBlock.timestamp * 1000),
    meta: {
      amount: {
        wei: w.event.args.collected.toBigInt(),
        currency: Currency.DAI
      },
      toAddress: get(walletStore).accounts[0]
    }
  })) || [];
