<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import Connect from '$components/Connect.svelte';

	$: onExplore = $page.url.pathname.includes('explore') || $page.url.pathname === '/';
	$: onDashboard = $page.url.pathname.includes('dashboard');
</script>

<header>
	<nav>
		<div class="home">
			<a sveltekit:prefetch href="/" class:active={onExplore}>Explore</a>
			<a href="/dashboard" on:click={() => goto(`/dashboard`)} class:active={onDashboard}
				>Dashboard</a
			>
		</div>

		<div class="user">
			<Connect />
		</div>
	</nav>
</header>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	.home {
		display: flex;
		align-items: center;
	}
	.home > a {
		color: var(--color-foreground-level-5);
		padding: 0.5rem 1rem;
		text-decoration: none;
		margin-right: 1rem;
		font-weight: 600;
		border-radius: 0.5rem;
		transition: all 0.3s;
	}
	.home > a:hover {
		background-color: var(--color-foreground-level-2);
	}
	.home > a.active {
		color: var(--color-foreground);
		background-color: var(--color-foreground-level-2);
	}
</style>
