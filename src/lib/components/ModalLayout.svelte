<script lang="ts">
	import * as modal from '$lib/utils/modal';
	import { fade, fly } from 'svelte/transition';

	const modalStore = modal.store;

	$: store = $modalStore;

	const clickOutside = () => {
		modal.hide();
	};
</script>

{#if store !== null}
	<div class="modal-layout" data-cy="modal-layout">
		<div class="overlay" transition:fade={{ duration: 200 }} on:click={clickOutside} />
		<div class="content">
			<div class="modal-wrapper" transition:fly={{ y: 10, duration: 300 }}>
				<svelte:component this={store.modalComponent} {...store.modalComponentProps} />
			</div>
		</div>
	</div>
{/if}

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
</style>
