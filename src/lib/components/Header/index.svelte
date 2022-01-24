<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	// TODO Connect to wallet state.
	let provider = true;
</script>

<header>
	<div class="home" class:active={$page.url.pathname === '/'}>
		<a sveltekit:prefetch href="/"><h2>👔 Workstreams</h2></a>
	</div>

	<div class="corner">
		<button on:click={() => dispatch('createAction')}>Create workstream</button>
		{#if provider}
			<button>disconnect</button>
		{:else}
			<button>connect</button>
		{/if}
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.home > a {
		color: var(--color-white);
		text-decoration: none;
	}

	.home > a:hover {
		color: var(--color-pink);
		text-shadow: 0 0 1rem var(--color-pink-dark);
	}

	.home > a:active {
		color: var(--color-pink-dark);
		text-shadow: 0 0 1rem var(--color-pink-darker);
	}
</style>
