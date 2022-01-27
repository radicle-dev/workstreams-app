<script lang="ts">
	import { closeModal } from '$lib/stores/modalStore.js';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let type: string;
</script>

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
		Creates a work stream with a start date and fixed day rate. There can be multiple people working
		in the same role.
	</p>
</div>
<div class="actions">
	<button class="transparent" label="Close" on:click={$closeModal}>Close</button>
	<button on:click={() => dispatch('nextAction')}>Next</button>
</div>

<style>
	h3 {
		margin: 1rem 0;
	}

	p {
		color: var(--color-teal);
	}

	p:first-of-type {
		margin-bottom: 2rem;
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

	.actions {
		display: flex;
		justify-content: center;
		padding-top: 0.5rem;
		margin: 2rem 0 0;
		gap: 0.75rem;
	}
</style>
