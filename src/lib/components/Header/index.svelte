<script lang="ts">
	import { page } from '$app/stores';

	// TODO Connect to wallet state.
	let provider = true;
</script>

<header>
	<div class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></div>

	<div class="corner">
		<button>Create workstream</button>
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
	}
</style>
