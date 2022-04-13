<script lang="ts">
	export let type = 'text';
	export let value: string = undefined;
	export let label: string;
	export let placeholder: string;
</script>

<label for={label}>
	{#if label}
		<span class="label typo-text-bold">{label}</span>
	{/if}
	{#if type === 'text'}
		<input type="text" bind:value {placeholder} name={label} id={label} />
	{:else if type === 'textarea'}
		<textarea rows="3" bind:value {placeholder} name={label} id={label} />
	{/if}
</label>

<style>
	label {
		display: flex;
		flex-direction: column;
	}
	.label {
		align-self: flex-start;
		color: var(--color-foreground-level-6);
		margin-bottom: 0.5rem;
	}
	input,
	textarea {
		background-color: var(--color-background);
		border: 1px solid var(--color-foreground-level-3);
		padding: 0.5rem 0.75rem;
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
</style>
