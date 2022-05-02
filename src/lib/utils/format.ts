import type { Timestamp } from '$lib/stores/workstreams/types';
import { ethers } from 'ethers';

export function formatAddress(input: string): string {
  const addr = ethers.utils.getAddress(input).replace(/^0x/, '');
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

export function roundDayRate(rate: number): number {
  return Math.round((rate + Number.EPSILON) * 100) / 100
}
