<script lang="ts">
	export let size: string = 'small';
</script>

<span
	class={`tag ${size === 'large' ? 'typo-regular' : 'typo-text-small'}`}
	class:small={size === 'small'}
	class:large={size === 'large'}><slot /></span
>

<style>
	.tag {
		padding: 0.1875rem 0.5rem 0.3125rem;
		background-color: var(--color-pink-darker);
		border-radius: 0.75rem;
		margin-left: 0.75rem;
		color: var(--color-pink);
	}

	.large {
		padding: 0.1875rem 0.75rem 0.3125rem;
		border-radius: 1rem;
	}
</style>
