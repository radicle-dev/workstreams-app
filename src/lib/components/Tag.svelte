<script lang="ts">
	export let style: string = undefined;
</script>

<span class="tag typo-text-small-bold" {style}><slot /></span>

<style>
	.tag {
		padding: 0.1875rem 0.5rem 0.3125rem;
		border-radius: 0.375rem;
		color: var(--color-primary);
		background-color: var(--color-primary-level-1);
	}
</style>
