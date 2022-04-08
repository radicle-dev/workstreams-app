<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import Connect from '$components/Connect.svelte';
</script>

<header>
	<div class="home" class:active={$page.url.pathname === '/'}>
		<a sveltekit:prefetch href="/" class:active={$page.url.pathname === '/'}>Explore</a>
		<a
			href="/dashboard"
			on:click={() => goto(`/dashboard`)}
			class:active={$page.url.pathname === '/dashboard'}>Dashboard</a
		>
	</div>

	<div class="user">
		<Connect />
	</div>
</header>

<style>
	header {
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
		border-radius: 0.5rem;
	}
	.home > a:hover {
		background-color: var(--color-foreground-level-2);
	}
	.home > a.active {
		color: var(--color-foreground);
		background-color: var(--color-foreground-level-2);
		font-weight: 600;
	}
</style>
