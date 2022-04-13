<script lang="ts">
	import { formatAddress } from '$lib/utils/format';
	import { walletStore } from '$lib/stores/wallet/wallet';
	import Button from '$components/Button.svelte';
	import { authStore } from '$lib/stores/auth/auth';

	$: label = $walletStore.connected && formatAddress($walletStore.address);

	let locked: boolean;

	async function logIn() {
		locked = true;
		try {
			if (!$walletStore.connected) await walletStore.connect();
			if (!$authStore.authenticated) await authStore.authenticate($walletStore);
		} catch {}
		locked = false;
	}
</script>

{#if $walletStore.connected && $authStore.authenticated}
	<Button
		variant="outline"
		on:click={() => walletStore.disconnect()}
		on:blur={() => console.log('blur')}
		on:focus={() => console.log('focus')}
		on:mouseout={() => (label = formatAddress($walletStore.connected && $walletStore.address))}
		on:mouseover={() => (label = 'disconnect')}>{label}</Button
	>
{:else if locked }
	<Button disabled variant="outline">. . .</Button>
{:else}
	<Button on:click={() => logIn()} variant="outline">Log in</Button>
{/if}
