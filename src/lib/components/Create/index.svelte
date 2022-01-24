<script lang="ts">
	import { closeModal } from '$lib/stores/modalStore.js';
	import Modal from '@components/Modal/index.svelte';
	import TextInput from '$lib/shared/TextInput.svelte';
	import Spinner from '$lib/shared/Spinner.svelte';

	let type: string = 'grant';
	let steps: number = 1;
	let title: string;
	let rate: string;
	let desc: string;
	let roleStart: string;
	let grantDuration: string;
</script>

<Modal>
	<div slot="body" class="container">
		{#if steps === 1}
			<span class="emoji">👔</span>
			<h3>Create a work stream</h3>
			<p>Start with choosing the type of workstream.</p>
			<div class="inputs">
				<label for="type">
					<input type="radio" bind:group={type} name="type" value="grant" />
					Grant
				</label>
				<p>
					Creates a work stream with a fixed duration and rate. Only one single wallet can be the
					recipient.
				</p>
				<label for="type">
					<input type="radio" bind:group={type} name="type" value="role" />
					Role
				</label>
				<p>
					Creates a work stream with a start date and fixed day rate. There can be multiple people
					working in the same role.
				</p>
			</div>
			<div class="actions">
				<button class="transparent" label="Close" on:click={$closeModal}>Close</button>
				<button
					on:click={() => {
						steps = steps + 1;
					}}>Next</button
				>
			</div>
		{:else if steps === 2}
			<span class="emoji">👔</span>
			<h3>Create a work stream</h3>
			<p>Describe the {type} and set a rate.</p>
			<TextInput
				style="margin-bottom: 2rem;"
				label="Title"
				placeholder="Enter a title"
				value={title}
			/>
			<div class="meta">
				<TextInput
					style="margin-bottom: 2rem;"
					placeholder="Enter rate per day in DAI"
					label="Rate per day"
					value={rate}
				/>
				{#if type === 'grant'}
					<TextInput
						style="margin-bottom: 2rem;"
						placeholder="Enter amount of days"
						label="Grant duration"
						value={grantDuration}
					/>
				{:else if type === 'role'}
					<TextInput
						style="margin-bottom: 2rem;"
						placeholder="Enter a date"
						label="Start date"
						value={roleStart}
					/>
				{/if}
			</div>
			<TextInput
				style="margin-bottom: 2rem;"
				label="Description"
				placeholder="Enter a description (markdown supported)"
				value={desc}
			/>

			<div class="actions">
				<button
					class="transparent"
					on:click={() => {
						steps = steps - 1;
					}}>Back</button
				>
				<button
					on:click={() => {
						steps = steps + 1;
					}}>Create {type}</button
				>
			</div>
		{:else if steps === 3}
			<span class="emoji">👔</span>
			<h3>Create a work stream</h3>
			<p>Please sign in your connected wallet</p>
			<Spinner style="display: flex;justify-content: center;" />
			<div class="actions">
				<button class="transparent" label="Done" on:click={$closeModal}>Done</button>
			</div>
		{/if}
	</div>
</Modal>

<style>
	.container > * {
		margin-bottom: 2rem;
	}
	.container > p {
		color: var(--color-teal);
	}

	h3 {
		margin-top: 1rem;
	}

	.inputs {
		background-color: var(--color-teal-darker);
		padding: 1.5rem;
		text-align: left;
		border-radius: 1rem;
	}

	input {
		margin-bottom: 1rem;
	}
	p:first-of-type {
		margin-bottom: 2rem;
	}

	.meta {
		display: flex;
		gap: 1.5rem;
	}

	.actions {
		display: flex;
		justify-content: center;
		padding-top: 0.5rem;
		margin: 2rem 0 0;
		gap: 0.75rem;
	}
</style>
