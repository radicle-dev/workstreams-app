<script lang="ts">
	export let size: string = 'small';
	export let color: string = 'pink';
</script>

<span
	class={`tag ${size === 'large' ? 'typo-regular' : 'typo-text-small'}`}
	class:small={size === 'small'}
	class:large={size === 'large'}
	style={`color: var(--color-${color}); background-color: var(--color-${color}-darker);`}
	><slot /></span
>

<style>
	.tag {
		padding: 0.1875rem 0.5rem 0.3125rem;
		border-radius: 0.75rem;
		margin-left: 0.75rem;
	}

	.large {
		padding: 0.1875rem 0.75rem 0.3125rem;
		border-radius: 1rem;
	}
</style>
