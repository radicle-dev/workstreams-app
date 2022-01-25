<script lang="ts">
	import Input from '$lib/shared/Input.svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let type: string;
	export let title: string;
	export let rate: string;
	export let desc: string;
	export let roleStart: string;
	export let grantDuration: string;

	let disabled: boolean = false;

	$: disabled =
		title === undefined ||
		rate === undefined ||
		desc === undefined ||
		(type === 'role' ? roleStart === undefined : grantDuration === undefined)
			? true
			: false;
</script>

<span class="emoji">👔</span>
<h3>Create a work stream</h3>
<p>Describe the {type} and set a rate.</p>
<Input
	type="text"
	style="margin-bottom: 1rem;"
	label="Title"
	placeholder="Enter a title"
	bind:value={title}
/>
<div class="meta">
	<Input
		type="amount"
		style="width: 16.75rem; margin-bottom: 1rem"
		placeholder="Enter rate per day"
		label="Rate per day"
		bind:value={rate}
	/>
	{#if type === 'grant'}
		<Input
			type="number"
			style="width: 16.75rem; margin-bottom: 1rem"
			placeholder="Enter amount of days"
			label="Grant duration"
			bind:value={grantDuration}
		/>
	{:else if type === 'role'}
		<Input
			type="date"
			style="width: 16.75rem; margin-bottom: 1rem"
			placeholder="Enter a date"
			label="Start date"
			bind:value={roleStart}
		/>
	{/if}
</div>
<Input
	type="text"
	label="Description"
	placeholder="Enter a description (markdown supported)"
	bind:value={desc}
/>
<div class="actions">
	<button class="transparent" on:click={() => dispatch('backAction')}>Back</button>
	<button {disabled} on:click={() => dispatch('nextAction')}>Create {type}</button>
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

	.meta {
		display: flex;
		gap: 1.5rem;
		width: 40rem;
	}

	.actions {
		display: flex;
		justify-content: center;
		padding-top: 0.5rem;
		margin: 2rem 0 0;
		gap: 0.75rem;
	}
</style>
