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
  creator: string;
  created_at: Timestamp;
  payment: Payment;
  title: string;
  desc: string;
  applicants?: string[];
  rejectedApplications?: string[];
  applicationsToReview?: string[];
  acceptedApplication?: string;
  duration: number;
}

export interface Payment {
  currency: Currency;
  rate: number;
}

export type WorkstreamInput = Omit<
  Workstream,
  'id' | 'state' | 'creator' | 'created_at'
>;

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
  counterOffer?: Payment;
  workstreamId: string;
}

export type ApplicationInput = Omit<
  Application,
  'id' | 'state' | 'creator' | 'created_at' | 'workstreamId'
>;
