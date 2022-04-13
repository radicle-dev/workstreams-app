<script lang="ts">
	import Header from '$components/Header.svelte';
	import ModalLayout from '$components/ModalLayout.svelte';
	import '../app.css';
</script>

<ModalLayout />
<article>
	<Header />
	<main>
		<slot />
	</main>

	<footer>
		<p>by radicle 🌱</p>
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
		color: var(--color-foreground-level-5);
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
