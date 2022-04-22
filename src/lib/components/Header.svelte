<script lang="ts">
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

  import Connect from '$components/Connect.svelte';

	$: onExplore = $page.url.pathname.includes('explore') || $page.url.pathname === '/';
	$: onDashboard = $page.url.pathname.includes('dashboard');

	let scrolledDown = false;

	onMount(() => {
		window.addEventListener('scroll', () => {
			scrolledDown = window.scrollY !== 0;
		});
	});
</script>

<header style:box-shadow={scrolledDown ? 'var(--color-shadows)' : ''}>
	<div class="inner">
		<div class="logo" on:click={() => goto(`/`)}>
			<img src="/logo.svg" alt="Radicle Logo" />
			<h4>Workstreams</h4>
		</div>
		<nav>
			<div class="home">
				<a sveltekit:prefetch href="/" class:active={onExplore}>Explore</a>
				<a href="/dashboard" on:click={() => goto(`/dashboard`)} class:active={onDashboard}
					>Dashboard</a
				>
			</div>
		</nav>
		<div class="user">
			<Connect />
		</div>
	</div>
</header>

<div class="spacer" />

<style>
	header {
		top: 0;
		left: 0;
		right: 0;
		height: 80px;
		box-sizing: border-box;
		background-color: var(--color-background);
		z-index: 10;
		position: fixed;
		padding: 16px 24px;
		transition: box-shadow 0.3s;
	}

	.inner {
		display: flex;
		gap: 48px;
		align-items: center;
	}

	.spacer {
		height: 96px;
	}

	.logo {
		display: flex;
		gap: 8px;
		height: 40px;
		align-items: center;
		cursor: pointer;
	}
	nav {
		display: flex;
		flex: 1;
		justify-content: space-between;
		align-items: center;
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
