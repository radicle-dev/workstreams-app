<script lang="ts">
	import { page } from '$app/stores';
</script>

<header>
	<div class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></div>
	<!-- <li class:active={$page.url.pathname === '/about'}>
				<a sveltekit:prefetch href="/about">About</a>
			</li>
			<li class:active={$page.url.pathname === '/todos'}>
				<a sveltekit:prefetch href="/todos">Todos</a>
			</li> -->

	<div class="corner">
		<button>connect</button>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}
</style>
