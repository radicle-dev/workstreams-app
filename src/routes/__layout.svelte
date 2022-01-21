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
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>