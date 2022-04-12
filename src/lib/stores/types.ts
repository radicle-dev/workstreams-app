export enum WorkstreamState {
  RFA = "rfa", // Request for Applications. Initial state of Workstream
  ACTIVE = "active",
  CLOSED = "closed",
  CANCELLED = "cancelled",
}

export enum WorkstreamType {
  GRANT = "grant",
  ROLE = "role",
}

export enum Currency {
  DAI = "dai",
}

export interface Timestamp {
	_seconds: number;
	_nanoseconds: number;
}

export interface WorkstreamBase {
  id: string;
  state: WorkstreamState;
  creator: string;
  created_at: Timestamp;
  payment_rate?: number;
  payment_currency?: Currency;
  title: string;
  desc: string;
}

export interface Grant extends WorkstreamBase {
  type: WorkstreamType.GRANT;
  length?: number;
}

export interface Role extends WorkstreamBase {
  type: WorkstreamType.ROLE;
}

export type Workstream = Grant | Role;

export type Application = {
	title: string;
	proposal_id: number;
	desc: string;
	creator: string;
	recipients: Array<string>;
	payment_rate: number;
	currency: string;
	created_at: number;
	ending_at: number;
	workstream_id: string;
	state: string;
};
