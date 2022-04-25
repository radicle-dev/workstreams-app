<script lang="ts">
	import { onMount } from 'svelte';
	import Button from 'radicle-design-system/Button.svelte';
	import EyeOpen from 'radicle-design-system/icons/EyeOpen.svelte';
	import EyeClosed from 'radicle-design-system/icons/EyeClosed.svelte';

	const STORAGE_KEY = 'theme';
	const DARK_PREFERENCE = '(prefers-color-scheme: dark)';
	let currentTheme = '';

	const THEMES = {
		DARK: 'dark',
		LIGHT: 'light'
	};

	const prefersDarkThemes = () => window.matchMedia(DARK_PREFERENCE).matches;

	const toggleTheme = () => {
		const stored = localStorage.getItem(STORAGE_KEY);

		if (stored) {
			// clear storage
			localStorage.removeItem(STORAGE_KEY);
		} else {
			// store opposite of preference
			localStorage.setItem(STORAGE_KEY, prefersDarkThemes() ? THEMES.LIGHT : THEMES.DARK);
		}

		applyTheme();
	};

	const applyTheme = () => {
		const preferredTheme = prefersDarkThemes() ? THEMES.DARK : THEMES.LIGHT;
		currentTheme = localStorage.getItem(STORAGE_KEY) ?? preferredTheme;

		if (currentTheme === THEMES.DARK) {
			document.documentElement.setAttribute('data-theme', 'dark');
		} else {
			document.documentElement.setAttribute('data-theme', 'light');
		}
	};

	onMount(() => {
		applyTheme();
		window.matchMedia(DARK_PREFERENCE).addEventListener('change', applyTheme);
	});
</script>

{#if currentTheme !== THEMES.DARK}
	<Button variant="outline" icon={EyeOpen} on:click={toggleTheme} />
{:else}
	<Button variant="outline" icon={EyeClosed} on:click={toggleTheme} />
{/if}

<style>
</style>
