<script context="module">
	/* eslint-disable */
	export const load = async ({ url }) => ({ props: { url } });
	/* eslint-enable */
</script>

<script lang="ts">
	import { browser } from '$app/env';

	import { navigating } from '$app/stores';
	import Header from '$components/Header.svelte';
	import ModalLayout from '$components/ModalLayout.svelte';
	import FlyTransition from '$lib/components/FlyTransition.svelte';
	import { onMount } from 'svelte';
	import '../app.css';

	export let url: string;

	enum Theme {
		DARK = 'dark',
		LIGHT = 'light'
	}

	let prefersDarkThemes = false;

	$: {
		if (browser) {
			if (prefersDarkThemes) {
				document.documentElement.setAttribute('data-theme', Theme.DARK);
			} else {
				document.documentElement.setAttribute('data-theme', Theme.LIGHT);
			}
		}
	}

	onMount(() => {
		if (browser) {
			prefersDarkThemes = window.matchMedia('(prefers-color-scheme: dark)').matches;

			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
				prefersDarkThemes = event.matches;
			});
		}
	});
</script>

<ModalLayout />
<div class="wrapper" class:loading={$navigating}>
	<Header />
	<main>
		<FlyTransition {url}>
			<slot />
		</FlyTransition>
	</main>
</div>

<style>
	.wrapper {
		height: 100vh;
		max-width: 90rem;
		min-width: 40rem;
		margin: 0 auto;
		padding: 1.5rem;
		transition: opacity 0.3s;
	}

	.wrapper.loading {
		opacity: 0.3;
	}
	main {
		display: flex;
		flex-direction: column;
	}
	/* footer {
		margin-top: 2rem;
		color: var(--color-foreground-level-5);
		display: flex;
		justify-content: center;
		align-items: center;
	} */
</style>
