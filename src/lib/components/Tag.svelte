<script lang="ts">
	export let size = 'small';
	export let style: string = undefined;
</script>

<span
	class={`tag ${size === 'large' ? 'typo-regular' : 'typo-text-small'}`}
	class:small={size === 'small'}
	class:large={size === 'large'}
	{style}><slot /></span
>

<style>
	.tag {
		padding: 0.1875rem 0.5rem 0.3125rem;
		border-radius: 0.375rem;
		color: var(--color-primary);
		background-color: var(--color-primary-level-1);
	}
	.large {
		padding: 0.1875rem 0.75rem 0.3125rem;
		border-radius: 1rem;
	}
</style>
