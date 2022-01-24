<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	// TODO Connect to wallet state.
	let provider = true;
</script>

<header>
	<div class="home" class:active={$page.url.pathname === '/'}>
		<a sveltekit:prefetch href="/"><h3>👔 Workstreams</h3></a>
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
		color: var(--color-blue);
		text-shadow: 0 0 1rem var(--color-blue-dark);
	}

	.home > a:active {
		color: var(--color-blue-dark);
		text-shadow: 0 0 1rem var(--color-blue-darker);
	}
</style>
