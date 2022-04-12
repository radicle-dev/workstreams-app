<script lang="ts">
	export let currency = 'DAI';
	export let type = 'text';
	export let style: string = undefined;
	export let value: string = undefined;
	export let label: string;
	export let placeholder: string;
</script>

<label for={label} {style}>
	{#if label}
		<span class="label">{label}</span>
	{/if}
	{#if type === 'text'}
		<input {style} type="text" bind:value {placeholder} name={label} id={label} />
	{:else if type === 'number'}
		<input {style} type="number" bind:value {placeholder} name={label} id={label} />
	{:else if type === 'amount'}
		<div class="input-box">
			<input
				{style}
				class="amount"
				type="amount"
				bind:value
				{placeholder}
				name={label}
				id={label}
			/>
			<span class="currency typo-text-bold">{currency}</span>
		</div>
	{:else if type === 'date'}
		<input {style} type="date" bind:value {placeholder} name={label} id={label} />
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
		color: var(--color-foreground-level-5);
		margin-bottom: 0.5rem;
	}
	.input-box {
		position: relative;
	}
	.currency {
		position: absolute;
		color: var(--color-primary);
		right: 1rem;
		top: 0.75rem;
	}
	input,
	textarea {
		position: block;
		background-color: var(--color-background);
		border: 1px solid var(--color-foreground-level-5);
		padding: 0.6875rem 0.75rem;
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
		box-shadow: 0 0 0.5rem var(--color-primary-level-1);
	}
</style>
