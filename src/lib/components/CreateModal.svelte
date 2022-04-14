<script lang="ts">
	import * as modal from '$lib/utils/modal';
	import Modal from '$components/Modal.svelte';
	import Button from '$components/Button.svelte';
	import Dropdown from './Dropdown.svelte';
	import { WorkstreamInput, WorkstreamType } from '$lib/stores/workstreams/types';
	import { getConfig } from '$lib/config';

	let type = WorkstreamType.GRANT;
	let title: string;
	let total: number;
	let rate: number;
	let desc: string;
	let durationAmount: number;
	let creatingWorkstream = false;

	const durationOptions = [
		{ value: '1', title: 'days' },
		{ value: '7', title: 'weeks' },
		{ value: '30', title: 'months' },
		{ value: '365', title: 'years' }
	];

	let durationInterval = durationOptions[0].value;

	$: disabled =
		title === undefined || rate === undefined || desc === undefined || creatingWorkstream

	$: {
		if (type === WorkstreamType.ROLE) {
			durationAmount = 1;
			durationInterval = durationOptions[3].value;
		}
	}

	$: {
		if (
			durationAmount
			&& durationInterval
			&& total
		) {
			rate = total / (durationAmount * parseInt(durationInterval));
		}
	}

	async function createWorkstream() {
		creatingWorkstream = true;

		try {
			await fetch(`${getConfig().API_URL_BASE}/workstreams`, {
				method: "POST",
				credentials: 'include',
				body: JSON.stringify({
					payment: {
						currency: 'dai',
						rate: rate,
					},
					title,
					desc,
					type,
					duration: durationAmount * parseInt(durationInterval),
				} as WorkstreamInput)
			});
		} catch (e) {
			creatingWorkstream = false;
			return;
		}
		modal.hide();
	}
</script>

<Modal>
	<div slot="body">
		<span class="emoji">👔</span>
		<h1>Create a work stream</h1>
		<div class="inputs">
			<div class="radio">
				<label for="type">
					<input type="radio" bind:group={type} name="type" value="grant" />
					Grant
				</label>
				<p>A limited time project</p>
			</div>
			<div class="radio">
				<label for="type">
					<input type="radio" bind:group={type} name="type" value="role" />
					Role
				</label>
				<p>A long term commitment</p>
			</div>
		</div>
		<div class="input-w-label">
			<span class="label typo-text-bold">Title</span>
			<input type="text" bind:value={title} name="title" id="title" style="margin-bottom: 1rem;" />
		</div>
		<div class="meta">
			<div class="input-w-label">
				<span class="label typo-text-bold">Amount</span>
				<div>
					<input
						class="total"
						type="amount"
						placeholder="0"
						bind:value={total}
						name="total"
						id="total"
					/>
					<span class="typo-text-bold">DAI</span>
				</div>
			</div>
			<span class="meta-calc typo-text-bold">/</span>
			<div class="input-w-label">
				<span class="label typo-text-bold" class:disabled={type === 'role'}>Duration</span>
				<div style="display: flex;">
					<input
						class="duration"
						class:disabled={type === 'role'}
						disabled={type === 'role'}
						type="amount"
						placeholder="1"
						bind:value={durationAmount}
						name="duration"
						id="duration"
					/>
					<Dropdown
						disabled={type === 'role'}
						bind:value={durationInterval}
						options={durationOptions}
						placeholder={type === 'role' ? durationOptions[3].title : durationOptions[0].title}
					/>
				</div>
			</div>
			<span class="meta-calc typo-text-bold">=</span>
			<div class="input-w-label">
				<span class="label typo-text-bold disabled">Stream rate</span>
				<div>
					<input
						class="stream-rate"
						class:disabled={type === 'grant'}
						type="amount"
						placeholder="0"
						bind:value={rate}
						name="stream-rate"
						id="stream-rate"
						disabled
					/>
					<span class="typo-text-bold disabled">DAI / 24h</span>
				</div>
			</div>
		</div>
		<div class="input-w-label">
			<span class="label typo-text-bold">Description</span>
			<textarea rows="3" bind:value={desc} name="desc" id="desc" />
		</div>
		<div class="actions">
			<Button variant="transparent" on:click={() => modal.hide()}>Close</Button>
			<Button {disabled} on:click={createWorkstream}>Create</Button>
		</div>
	</div>
</Modal>

<style>
	h1 {
		margin: 1rem 0 2rem;
	}
	.emoji {
		font-size: 2rem;
	}
	.inputs {
		display: flex;
		justify-content: space-between;
		margin-bottom: 2rem;
	}
	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.radio {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.radio > p {
		color: var(--color-foreground-level-4);
	}
	.meta {
		display: flex;
		gap: 1.5rem;
		align-items: flex-end;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		padding-top: 0.5rem;
		margin: 2rem 0 0;
		gap: 0.75rem;
	}
	.input-w-label {
		display: flex;
		flex-direction: column;
	}
	.label {
		align-self: flex-start;
		color: var(--color-foreground-level-6);
		margin-bottom: 0.5rem;
	}
	.disabled {
		color: var(--color-foreground-level-3);
	}
	.total,
	.stream-rate {
		width: 5.6rem;
	}
	.duration {
		width: 3rem;
		margin-right: 0.5rem;
	}

	input {
		height: 2.5rem;
	}
	input,
	textarea {
		background-color: var(--color-background);
		border: 1px solid var(--color-foreground-level-3);
		padding: 0.4rem 0.75rem;
		border-radius: 0.5rem;
		color: var(--color-foreground);
	}
	textarea {
		resize: vertical;
	}
	input::placeholder,
	textarea::placeholder {
		color: var(--color-foreground-level-5);
	}
	input:focus,
	textarea:focus {
		outline: none !important;
		border-color: var(--color-primary);
	}
	.meta-calc {
		color: var(--color-foreground-level-5);
		padding-bottom: 0.5rem;
	}
</style>
