<script lang="ts">
	import { providerStore } from 'web3-stores';
	import { formatAddress } from '$lib/utils/format';

	$: label = $providerStore.connected && formatAddress($providerStore.accounts[0]);
</script>

{#if $providerStore.connected}
	<button
		on:click={() => providerStore.disconnect()}
		on:blur={() => console.log('blur')}
		on:focus={() => console.log('focus')}
		on:mouseout={() => (label = formatAddress($providerStore.accounts[0]))}
		on:mouseover={() => (label = 'disconnect')}>{label}</button
	>
{:else}
	<button on:click={() => providerStore.connect()}>connect</button>
{/if}
