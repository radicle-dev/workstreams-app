import type { BigNumberish } from 'ethers';

export interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
}

export enum WorkstreamState {
  RFA = 'rfa', // Request for Applications. Initial state of Workstream
  ACTIVE = 'active',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

export enum Currency {
  DAI = 'dai'
}

export interface Workstream {
  id: string;
  state: WorkstreamState;
  applicationsToReview: string[];
  rejectedApplications?: string[];
  acceptedApplication?: string;
  creator: string;
  durationDays: number;
  created_at: Timestamp;
  ratePerSecond: Money;
  total: Money;
  title: string;
  desc: string;
  dripsData?: {
    accountId: bigint;
    chainId: number;
  };
  applicants?: string[];
}

export interface Money {
  currency: Currency;
  wei: bigint;
}

export interface MoneyInput {
  currency: Currency;
  wei: BigNumberish;
}

export interface WorkstreamInput {
  ratePerSecond: MoneyInput;
  title: string;
  desc: string;
  durationDays: number;
}

export enum ApplicationState {
  WAITING = 'waiting',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface Application {
  id: string;
  state: ApplicationState;
  creator: string;
  created_at: Timestamp;
  letter: string;
  counterOffer?: {
    ratePerSecond: Money;
    total: Money;
  };
  toUser: string;
  workstreamId: string;
}

export interface ApplicationInput {
  letter: string;
  ratePerSecond?: MoneyInput;
}
