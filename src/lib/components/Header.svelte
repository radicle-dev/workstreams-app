<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as modal from '$lib/utils/modal';
	import Protected from '$components/Protected.svelte';
	import Connect from '$components/Connect.svelte';
	import Create from '$components/Create/index.svelte';
</script>

<header>
	<div class="home" class:active={$page.url.pathname === '/'}>
		<a sveltekit:prefetch href="/"><h3>👔 Workstreams</h3></a>
		<Protected>
			<button on:click={() => modal.show(Create)}>Create</button>
		</Protected>
	</div>

	<div class="user">
		<a
			href="/outgoing"
			on:click={() => goto(`/outgoing`)}
			class:active={$page.url.pathname === '/outgoing'}>outgoing</a
		>
		<a
			href="/incoming"
			on:click={() => goto(`/incoming`)}
			class:active={$page.url.pathname === '/incoming'}>incoming</a
		>
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
		color: var(--color-white);
		text-decoration: none;
		margin-right: 2rem;
	}
	.home > a:hover {
		color: var(--color-blue);
		text-shadow: 0 0 1rem var(--color-blue-dark);
	}
	.home > a:active {
		color: var(--color-blue-dark);
		text-shadow: 0 0 1rem var(--color-blue-darker);
	}
	.user > a {
		margin-right: 1.5rem;
	}
</style>
