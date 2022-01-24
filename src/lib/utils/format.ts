import { ethers } from 'ethers';

export function formatAddress(input: string): string {
  const addr = ethers.utils.getAddress(input).replace(/^0x/, '');
  return addr.substring(0, 4) + ' – ' + addr.substring(addr.length - 4, addr.length);
}

export function timeframeFormat(timeframe: number): string {
  const weeks = Math.floor(timeframe / 7);
  if (weeks < 1) {
    return `${timeframe} days`;
  } else {
    return `${weeks} weeks`;
  }
}
export function startDateFormat(startdate: number): string {
  return new Date(startdate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
