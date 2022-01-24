<script lang="ts">
	import { modalState } from '$lib/stores/modalStore.js';
	import Header from '@components/Header/index.svelte';
	import Create from '@components/Create/index.svelte';
	import '../styles/reset.css';
	import '../styles/colors.css';
	import '../styles/typography.css';
	import '../styles/global.css';

	// Initiate Modals
	const createModal = { showModal: true, modalId: 'create' };
</script>

{#if $modalState == createModal}
	<Create />
{/if}

<Header on:createAction={() => modalState.update(() => createModal)} />
<main>
	<slot />
</main>

<footer>
	<p>by radicle 🌱</p>
</footer>

<style>
	main {
		display: flex;
		flex-direction: column;
	}
	footer {
		margin-top: 2rem;
		color: var(--color-grey-dark);
		display: flex;
		justify-content: center;
	}
</style>
