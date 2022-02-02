<script lang="ts">
	import * as modal from '$lib/utils/modal';

	const clickOutside = () => {
		modal.hide();
	};

	const modalStore = modal.store;
	// Hack to make svelte typecheck in the markup section.
	$: store = $modalStore;
</script>

<div class="modal-layout" class:hide={store === null} data-cy="modal-layout">
	<div class="overlay" on:click={clickOutside} />
	<div class="content">
		{#if store !== null}
			<svelte:component this={store.modalComponent} {...store.modalComponentProps} />
		{/if}
	</div>
</div>

<style>
	.modal-layout {
		height: 100%;
		width: 100%;
		position: fixed;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: scroll;
	}

	.overlay {
		background-color: rgba(0, 0, 0, 0.75);
		height: 100%;
		width: 100%;
		position: fixed;
	}

	.content {
		z-index: 200;
		margin: auto;
	}

	.hide {
		display: none;
	}
</style>
