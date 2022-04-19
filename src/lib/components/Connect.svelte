<script lang="ts">
	import { walletStore } from '$lib/stores/wallet/wallet';
	import Button from '$components/Button.svelte';
	import User from '$components/User.svelte';
	import { authStore } from '$lib/stores/auth/auth';
	import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

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

	let hover = false;
</script>

{#if $connectedAndLoggedIn}
	<div>
		<Button
			variant="outline"
			on:click={() => walletStore.disconnect()}
			on:mouseenter={() => (hover = true)}
			on:mouseleave={() => (hover = false)}
		>
			{#if hover}
				Sign out
			{:else}
				<User address={$authStore.address} />
			{/if}
		</Button>
	</div>
{:else if locked}
	<Button disabled variant="outline">. . .</Button>
{:else}
	<Button on:click={() => logIn()} variant="outline">Sign in with Ethereum</Button>
{/if}
