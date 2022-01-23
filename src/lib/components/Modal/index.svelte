<script lang="ts">
	import { closeModal } from '$lib/stores/modalStore.js';
</script>

<div class="modal-overlay" />

<div class="modal-floating">
	<div class="modal">
		<slot name="body" />

		<div class="modal-actions">
			<button label="Cancel" on:click={$closeModal}>close</button>
			<slot name="actions" />
		</div>
	</div>
</div>

<style>
	.modal-floating,
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.modal-floating {
		z-index: 300;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.modal-overlay {
		z-index: 200;
		background-color: rgba(0, 0, 0, 0.75);
	}
	.modal {
		padding: 2rem 3rem;
		border: 1px solid var(--color-teal-dark);
		background: var(--color-background);
		box-shadow: 0.5rem 0.5rem 4rem var(--color-teal-dark);
		min-width: 30rem;
		max-width: 48rem;
		text-align: center;
	}

	.modal-actions {
		padding-top: 0.5rem;
		margin-top: 2rem;
		text-align: center;
	}
</style>
