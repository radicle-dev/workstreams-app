<script lang="ts">
	export let style: string = undefined;
	export let label: string;
	export let placeholder: string;
	export let value: string;
</script>

<label for={label} {style}>
	{#if label}
		<span class="label">{label}</span>
	{/if}
	<input type="text" bind:value {placeholder} name={label} id={label} />
</label>

<style>
	label {
		display: flex;
		flex-direction: column;
	}
	.label {
		align-self: flex-start;
		color: var(--color-grey-darker);
		margin-bottom: 0.5rem;
	}
	input {
		background-color: var(--color-background);
		border: 1px solid var(--color-grey-darker);
		padding: 0.6875rem 0.75rem;
		border-radius: 0.5rem;
		color: var(--color-white);
	}

	input::placeholder {
		color: var(--color-grey-darker);
	}
</style>
