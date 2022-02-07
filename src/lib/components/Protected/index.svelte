<script lang="ts">
	// TODO Connect to wallet state.
	let loading = false;
	let provider = true;
</script>

{#if loading}
	<div>Loading ...</div>
{:else if provider}
	<slot />
{:else}
	<slot name="unauthorized">
		<div>Please connect your wallet.</div>
	</slot>
{/if}
