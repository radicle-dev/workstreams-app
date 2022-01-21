<script lang="ts">
	import { page } from '$app/stores';

    // TODO Connect to wallet state.
    let provider = true;
</script>

<header>
	<div class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></div>

	<!-- 
	<li class:active={$page.url.pathname === '/about'}>
		<a sveltekit:prefetch href="/about">About</a>
	</li>
	<li class:active={$page.url.pathname === '/todos'}>
		<a sveltekit:prefetch href="/todos">Todos</a>
	</li>
	-->

	{#if provider}
		<div class="corner">
			<button>disconnect</button>
		</div>
	{:else}
		<div class="corner">
			<button>connect</button>
		</div>
	{/if}
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		padding: 1rem;
	}
</style>
