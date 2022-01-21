<script lang="ts">
	import Avatar from './Avatar.svelte';

	export let address: string;
</script>

{#if address}
	<p><Avatar {address} />{address}</p>
{/if}
