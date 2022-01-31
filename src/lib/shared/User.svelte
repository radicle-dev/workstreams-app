<script lang="ts">
	import { ethers } from 'ethers';
	import { createIcon } from '../utils/blockies';
	import { formatAddress } from '../utils/format';
	import { onMount } from 'svelte';
	const provider = ethers.getDefaultProvider();

	export let style: string | undefined = undefined;
	export let address: string;
	export let avatar: boolean = true;
	export let showAddress: boolean = true;

	let uriData = '';
	let ensName;

	onMount(() => {
		uriData = blockyDataUri(address);
	});

	function blockyDataUri(urn: string) {
		return createIcon({
			seed: urn.toLowerCase(),
			size: 8,
			scale: 16
		}).toDataURL();
	}

	async function laodEnsData(): Promise<string> {
		ensName = await provider.lookupAddress(address);
		if (!ensName) {
			return;
		} else {
			return ensName;
		}
	}

	$: laodEnsData();
</script>

{#if address}
	<div class="container" {style}>
		{#if avatar}
			<img class="avatar" src={uriData} alt="user-avatar" />
		{/if}
		{#if showAddress}
			<p class="address typo-text-bold">
				{ensName === null ? formatAddress(address) : ensName}
			</p>
		{/if}
	</div>
{/if}

<style>
	.container {
		display: grid;
		grid-template-columns: 1.5rem auto;
	}

	.avatar {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.75rem;
		user-select: none;
		background-color: var(--color-grey-dark);
	}

	.address {
		margin-left: 0.5rem;
		white-space: nowrap;
	}
</style>
