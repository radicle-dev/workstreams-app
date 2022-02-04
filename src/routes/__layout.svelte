<script lang="ts">
	import { providerStore } from 'web3-stores';
	import { providers } from 'ethers';
	import Header from '$lib/components/Header.svelte';
	import ModalLayout from '$lib/components/ModalLayout.svelte';
	import '../app.css';

	// TODO Initiate Modals
</script>

<ModalLayout />
<article>
	<Header />
	<main>
		<slot />
	</main>

	<footer>
		<p>by radicle 🌱</p>
		{#if $providerStore.connected}
			<!-- <Tag> -->
			{providers.getNetwork(parseInt($providerStore.chainId)).name} network
			<!-- </Tag> -->
		{/if}
	</footer>
</article>

<style>
	article {
		height: 100vh;
		max-width: 90rem;
		min-width: 40rem;
		margin: 0 auto;
		padding: 1.5rem;
	}
	main {
		display: flex;
		flex-direction: column;
	}
	footer {
		margin-top: 2rem;
		color: var(--color-grey-dark);
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
