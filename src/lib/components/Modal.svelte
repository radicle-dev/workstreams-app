<script lang="ts">
	export let style: string = undefined;
</script>

<div class="modal" {style}>
	<slot name="body" />
</div>

<style>
	.modal {
		margin: 1.5rem;
		padding: 2.5rem;
		background: var(--color-background);
		border-radius: 1rem;
		box-shadow: var(--color-shadows);
		min-width: 24rem;
		width: 100%;
		max-width: 40rem;
		text-align: center;
	}
</style>
