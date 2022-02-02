<script lang="ts">
	import { providerStore } from 'web3-stores';
	import { ethers } from 'ethers';
	import { modalState } from '$lib/stores/modalStore.js';

	import Header from '@components/Header/index.svelte';
	import ModalLayout from '@components/ModalLayout/index.svelte';

	import Tag from '$lib/shared/Tag.svelte';

	import '../styles/reset.css';
	import '../styles/colors.css';
	import '../styles/typography.css';
	import '../styles/global.css';

	// Initiate Modals
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
			<Tag>
				{ethers.providers.getNetwork(parseInt($providerStore.chainId)).name} network
			</Tag>
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
