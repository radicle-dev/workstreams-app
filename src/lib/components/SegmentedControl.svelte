<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type SegmentedControlOption = {
		title: string;
		value: string;
	};

	export let style: string = undefined;
	export let active: string;
	export let options: SegmentedControlOption[];

	$: currentlyActive = active;

	const dispatch = createEventDispatcher();

	const onClick = (option: SegmentedControlOption) => {
		dispatch('select', option.value);
		currentlyActive = option.value;
	};
</script>

<div class="segmented-control" {style}>
	{#each options as option}
		<button
			class="typo-semi-bold"
			class:active={option.value === currentlyActive}
			data-cy="segmented-control-option"
			value={option.value}
			on:click={() => onClick(option)}
		>
			{option.title}
		</button>
	{/each}

	<slot />
</div>

<style>
	.segmented-control {
		display: flex;
		width: fit-content;
		max-height: 2.5rem;
		overflow: hidden;
	}
	button {
		min-height: 2.5rem;
		line-height: 1.375rem;
		border-radius: 0.5rem;
		cursor: pointer;
		padding: 0 0.75rem;
		margin: 0 0.25rem;
		border: none;
		background-color: var(--color-background);
		color: var(--color-foreground-level-5);
	}
	button:focus {
		outline: none;
	}
	button:hover,
	button:active {
		color: var(--color-foreground);
		background-color: var(--color-foreground-level-2);
	}
	button.active {
		color: var(--color-foreground);
		background-color: var(--color-foreground-level-2);
	}
</style>
