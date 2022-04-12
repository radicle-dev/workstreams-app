<script lang="ts">
	import { providerStore } from 'web3-stores';
	import { formatAddress } from '$lib/utils/format';
	import Button from '$components/Button.svelte';

	$: label = $providerStore.connected && formatAddress($providerStore.accounts[0]);
</script>

{#if $providerStore.connected}
	<Button
		variant="outline"
		on:click={() => providerStore.disconnect()}
		on:blur={() => console.log('blur')}
		on:focus={() => console.log('focus')}
		on:mouseout={() => (label = formatAddress($providerStore.accounts[0]))}
		on:mouseover={() => (label = 'disconnect')}>{label}</Button
	>
{:else}
	<Button on:click={() => providerStore.connect()} variant="outline">connect</Button>
{/if}
