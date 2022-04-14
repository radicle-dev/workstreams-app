<script lang="ts">
	import * as modal from '$lib/utils/modal';
	import Modal from '$components/Modal.svelte';
	import Button from './Button.svelte';
	import Dropdown from './Dropdown.svelte';
	import TokenStreams from './icons/TokenStreams.svelte';
	import TextInput from './TextInput.svelte';
	import TypeSwitcher from './TypeSwitcher.svelte';
	import { getConfig } from '$lib/config';
	import { WorkstreamInput, WorkstreamType } from '$lib/stores/workstreams/types';
	import ActionRow from './ActionRow.svelte';

	const durationOptions = [
		{ value: '1', title: 'Days' },
		{ value: '7', title: 'Weeks' },
		{ value: '30', title: 'Months' },
		{ value: '365', title: 'Years' }
	];

	let title: string;
	let total: string;
	let duration: string;
	let durationUnit: string = durationOptions[1].value;
	let description: string;
	let selectedType: 'first' | 'second';

	$: workstreamType = selectedType === 'first' ? WorkstreamType.GRANT : WorkstreamType.ROLE;

	$: streamRate =
		workstreamType === WorkstreamType.GRANT
			? parseInt(total) / (parseInt(duration) * parseInt(durationUnit))
			: parseInt(total) / 365;

	$: canSubmit =
		workstreamType === WorkstreamType.GRANT
			? [title, total, duration, durationUnit, description].every((v) => v)
			: [title, total, description].every((v) => v)

	let creatingWorkstream = false;

	async function createWorkstream() {
		creatingWorkstream = true;

		try {
			await fetch(`${getConfig().API_URL_BASE}/workstreams`, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify({
					payment: {
						currency: 'dai',
						rate: streamRate
					},
					title,
					desc: description,
					type: workstreamType,
					duration: parseInt(duration) * parseInt(durationUnit)
				} as WorkstreamInput)
			});
		} catch (e) {
			return;
		}
		modal.hide();
	}
</script>

<Modal>
	<div slot="body">
		<span class="emoji">👔</span>
		<h1>Create a Workstream</h1>
		<form>
			<div class="workstream-type">
				<TypeSwitcher bind:selected={selectedType}>
					<div slot="first" class="option">
						<h4>Grant</h4>
						<p>A fixed-length project.</p>
					</div>
					<div slot="second" class="option">
						<h4>Workstream</h4>
						<p>A long-term commitment.</p>
					</div>
				</TypeSwitcher>
			</div>
			<div class="input-with-label">
				<h4>Title</h4>
				<TextInput bind:value={title} placeholder="Max 256 characters" />
			</div>
			<div class="payment">
				{#if selectedType === 'first'}
					<div class="inner">
						<div class="input-with-label payout">
							<h4>Total Payout</h4>
							<TextInput bind:value={total} placeholder="0" suffix="DAI" />
						</div>
						<div class="input-with-label duration">
							<h4>Duration</h4>
							<div class="input-group">
								<div class="number"><TextInput bind:value={duration} placeholder="0" /></div>
								<div class="unit">
									<Dropdown bind:value={durationUnit} options={durationOptions} />
								</div>
							</div>
						</div>
					</div>
				{:else}
					<div class="inner">
						<div class="input-with-label payout">
							<h4>Yearly Salary</h4>
							<TextInput bind:value={total} placeholder="0" suffix="DAI" />
						</div>
					</div>
				{/if}
			</div>
			<div class="input-with-label">
				<h4>Description</h4>
				<TextInput bind:value={description} textarea placeholder="Max 256 characters" />
			</div>
		</form>
		<div class="actions">
			<Button disabled={creatingWorkstream} variant="outline" on:click={modal.hide}>Cancel</Button>
			<Button
				icon={TokenStreams}
				disabled={creatingWorkstream || !canSubmit}
				on:click={createWorkstream}
			>
				Create workstream</Button
			>
		</div>
	</div>
</Modal>

<style>
	form > * {
		margin-bottom: 32px;
	}
	h1 {
		margin: 1rem 0 2rem;
		color: var(--color-foreground);
	}

	h4 {
		color: var(--color-foreground-level-6);
	}
	.emoji {
		font-size: 2rem;
	}

	.workstream-type .option {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
	}

	.option > h4 {
		color: var(--color-foreground);
	}

	.option > p {
		color: var(--color-foreground-level-6);
	}

	.input-with-label {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.input-with-label > h4 {
		margin-bottom: 12px;
	}

	.payment > .inner {
		display: flex;
		gap: 24px;
	}

	.payment .payout {
		width: 128px;
	}

	.duration > .input-group {
		display: flex;
		gap: 8px;
	}

	.duration .number {
		width: 64px;
	}

	.duration .unit {
		width: 112px;
	}

	.actions {
		display: flex;
		gap: 16px;
		justify-content: flex-end;
	}
</style>
