<script lang="ts">
	import { formatAddress } from '$lib/utils/format';
	import { walletStore } from '$lib/stores/wallet/wallet';
	import Button from '$components/Button.svelte';
	import { authStore } from '$lib/stores/auth/auth';
	import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

	$: label = $walletStore.connected && formatAddress($walletStore.address);

	let locked: boolean;

	$: {
		console.log($connectedAndLoggedIn);
	}

	async function logIn() {
		locked = true;
		try {
			if (!$walletStore.connected) await walletStore.connect();
			if (!$connectedAndLoggedIn) await authStore.authenticate($walletStore);
		} finally {
			locked = false;
		}
	}
</script>

{#if $connectedAndLoggedIn}
	<Button variant="outline" on:click={() => walletStore.disconnect()}>{label}</Button>
{:else if locked}
	<Button disabled variant="outline">. . .</Button>
{:else}
	<Button on:click={() => logIn()} variant="outline">Sign in with Ethereum</Button>
{/if}
