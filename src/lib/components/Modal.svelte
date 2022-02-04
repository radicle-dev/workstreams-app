<div class="modal">
	<slot name="body" />
</div>

<style>
	.modal {
		margin: 1.5rem;
		padding: 2.5rem;
		border: 1px solid var(--color-teal-dark);
		background: var(--color-background);
		box-shadow: 0.5rem 0.5rem 4rem var(--color-teal-dark);
		min-width: 24rem;
		width: 100%;
		max-width: 40rem;
		text-align: center;
	}
</style>
