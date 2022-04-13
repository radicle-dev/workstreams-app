<script lang="ts">
	import { formatAddress } from '$lib/utils/format';
	import { walletStore } from '$lib/stores/wallet/wallet';
	import Button from '$components/Button.svelte';

	$: label = $walletStore.initialized && formatAddress($walletStore.address);

	$: {
		if ($walletStore.initialized && !$walletStore.authenticated) {
			walletStore.authenticate();
		}
	}
</script>

{#if $walletStore.initialized}
	<Button
		variant="outline"
		on:click={() => walletStore.disconnect()}
		on:blur={() => console.log('blur')}
		on:focus={() => console.log('focus')}
		on:mouseout={() => (label = formatAddress($walletStore.initialized && $walletStore.address))}
		on:mouseover={() => (label = 'disconnect')}>{label}</Button
	>
{:else}
	<Button on:click={() => walletStore.connect()} variant="outline">connect</Button>
{/if}
