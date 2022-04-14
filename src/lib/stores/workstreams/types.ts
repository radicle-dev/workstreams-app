export interface Timestamp {
	_seconds: number;
	_nanoseconds: number;
}

export enum WorkstreamState {
	RFA = 'rfa', // Request for Applications. Initial state of Workstream
	ACTIVE = 'active',
	CLOSED = 'closed',
	CANCELLED = 'cancelled'
}

export enum WorkstreamType {
	GRANT = 'grant',
	ROLE = 'role'
}

export enum Currency {
	DAI = 'dai'
}

export interface WorkstreamBase {
	id: string;
	state: WorkstreamState;
	creator: string;
	created_at: Timestamp;
	payment: Payment;
	title: string;
	desc: string;
}

export interface Payment {
	currency: Currency;
	rate: number;
}

export interface Grant extends WorkstreamBase {
	type: WorkstreamType.GRANT;
	duration?: number;
}

export interface Role extends WorkstreamBase {
	type: WorkstreamType.ROLE;
}

export type Workstream = Grant | Role;

export type WorkstreamInput = Omit<Workstream, 'id' | 'state' | 'creator' | 'created_at'>;

export enum ApplicationState {
	WAITING = 'waiting',
	ACCEPTED = 'accepted',
	DECLINED = 'declined'
}

export interface Application {
	id: string;
	state: ApplicationState;
	creator: string;
	created_at: Timestamp;
	letter: string;
	counterOffer?: {
		payment?: Payment;
		length?: number;
	};
	workstreamId: string;
}
