<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import * as modal from '$lib/utils/modal';

	import Connect from '$components/Connect.svelte';
	import Button from 'radicle-design-system/Button.svelte';
	import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
	import CreateModal from './CreateModal.svelte';
	import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

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
		<nav>
			<a sveltekit:prefetch href="/" class:active={onExplore}>Explore</a>
			<a
				sveltekit:prefetch
				href="/dashboard"
				on:click={() => goto(`/dashboard`)}
				class:active={onDashboard}>Dashboard</a
			>
		</nav>
		<div class="buttons">
			{#if $connectedAndLoggedIn && onDashboard}
				<div
					in:fly={{ y: 10, duration: 300, delay: 300 }}
					out:fly={{ y: 10, duration: 300 }}
					class="create-button"
				>
					<Button icon={TokenStreams} on:click={() => modal.show(CreateModal)}
						>Create workstream</Button
					>
				</div>
			{/if}
			<div class="user">
				<Connect />
			</div>
		</div>
	</div>
</header>

<div class="spacer" />

<style>
	header {
		top: 0;
		left: 0;
		right: 0;
		height: 72px;
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

	.buttons {
		display: flex;
		gap: 8px;
	}

	.spacer {
		height: 96px;
	}

	.logo {
		display: flex;
		gap: 8px;
		align-items: center;
		cursor: pointer;
	}
	nav {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 8px;
	}
	nav > a {
		color: var(--color-foreground-level-5);
		padding: 0.5rem 1rem;
		text-decoration: none;
		font-weight: 600;
		border-radius: 0.5rem;
		transition: all 0.3s;
	}
	nav > a:hover {
		background-color: var(--color-foreground-level-2);
	}
	nav > a.active {
		color: var(--color-foreground);
		background-color: var(--color-foreground-level-2);
	}
</style>
