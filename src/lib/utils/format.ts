import type { Money, Timestamp } from '$lib/stores/workstreams/types';
import { utils } from 'ethers';

export function formatAddress(input: string): string {
  const addr = utils.getAddress(input).replace(/^0x/, '');
  return (
    addr.substring(0, 4) + ' – ' + addr.substring(addr.length - 4, addr.length)
  );
}

export function timeframeFormat(days: number): string {
  const weeks = Math.floor(days / 7);

  if (days < 7 && days > 1) {
    return `${days} days`;
  } else if (days === 1) {
    return `${days} day`;
  } else if (weeks === 1) {
    return `${weeks} week`;
  } else if (weeks === 52) {
    return `1 year`;
  } else {
    return `${weeks} weeks`;
  }
}

export function dateFormat(timestamp: Timestamp): string {
  return new Date(timestamp._seconds * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function hyphenateString(str: string): string {
  return str.replace(/ +/g, '-').toLowerCase();
}

export function weiToDai(input: Money | bigint): number {
  let wei = typeof input === 'bigint' ? input : (input as Money).wei;

  if (typeof wei !== 'bigint') wei = BigInt(wei);

  const dai = wei / BigInt(1000000000000000000);

  return Number(dai);
}

export function currencyFormat(input: Money | bigint): string {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
  });

  let wei = typeof input === 'bigint' ? input : (input as Money).wei;

  if (typeof wei !== 'bigint') wei = BigInt(wei);

  const dai = utils.formatEther(wei);

  return formatter.format(Number(dai));
}
