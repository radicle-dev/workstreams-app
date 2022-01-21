<script lang="ts">
	import Header from '@components/Header/index.svelte';
	import '../styles/reset.css';
	import '../styles/colors.css';
	import '../styles/typography.css';
	import '../styles/global.css';
</script>

<Header />

<main>
	<slot />
</main>

<footer>
	<p>Some workstreams footer</p>
</footer>

<style>
	main {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 90rem;
	}
	footer {
		align-items: flex-end;
	}
</style>