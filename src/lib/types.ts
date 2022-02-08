export type SegmentedControlOption = {
	title: string;
	value: string;
};

export type Workstreams = Workstream[];

export type Workstream = {
	id: number;
	type: string;
	workstream_state: string;
	creator: string;
	created_at: number;
	starting_at: number;
	ending_at: number;
	payment_rate: number;
	payment_currency: string;
	receivers: Array<string>;
	title: string;
	desc: string;
	dripshub_account: number;
	applications: Application[];
};

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
	workstream_id: number;
	state: string;
};
