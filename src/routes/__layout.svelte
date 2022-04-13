<script context="module">
  export const load = async ({ url }) => ({ props: { url } });
</script>

<script lang="ts">
	import { navigating } from '$app/stores';
	import Header from '$components/Header.svelte';
	import ModalLayout from '$components/ModalLayout.svelte';
	import FlyTransition from '$lib/components/FlyTransition.svelte';
	import '../app.css';

	export let url;
</script>

<ModalLayout />
<div class="wrapper" class:loading={$navigating}>
	<Header />
	<main>
		<FlyTransition {url}>
			<slot />
		</FlyTransition>
	</main>

	<footer>
		<p>by radicle 🌱</p>
	</footer>
</div>

<style>
	.wrapper {
		height: 100vh;
		max-width: 90rem;
		min-width: 40rem;
		margin: 0 auto;
		padding: 1.5rem;
		transition: opacity .3s;
	}

	.wrapper.loading {
		opacity: .3;
	}
	main {
		display: flex;
		flex-direction: column;
	}
	footer {
		margin-top: 2rem;
		color: var(--color-foreground-level-5);
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
