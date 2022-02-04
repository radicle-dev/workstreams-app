<script lang="ts">
	import { providerStore } from 'web3-stores';

	// TODO Connect to loading store.
	let loading = false;
</script>

{#if loading}
	<div>Loading ...</div>
{:else if $providerStore.connected}
	<slot />
{:else}
	<slot name="unauthorized" />
{/if}
