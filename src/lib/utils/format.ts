import { ethers } from 'ethers';

export function formatAddress(input: string): string {
  const addr = ethers.utils.getAddress(input).replace(/^0x/, '');
  return addr.substring(0, 4) + ' – ' + addr.substring(addr.length - 4, addr.length);
}

export function timeframeFormat(start_date: number, end_date: number): string {
  const timeframe = end_date - start_date;
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

export function dateFormat(date: number): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function hyphanateString(str: string): string {
  return str.replace(/ +/g, '-').toLowerCase();
}
