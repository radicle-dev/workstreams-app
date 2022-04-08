<script lang="ts">
	import { onMount } from 'svelte';
	import { ethers } from 'ethers';
	import { createIcon } from '$lib/utils/blockies';
	import { formatAddress } from '$lib/utils/format';

	export let avatar = true;
	export let showAddress = true;
	export let address: string;
	export let style: string = undefined;

	const ethersProvider = ethers.getDefaultProvider();
	let uriData: string;
	let ensName: string;

	onMount(() => {
		uriData = blockyDataUri(address);
		laodEnsData();
	});

	$: laodEnsData = async () => {
		const checksummedAddress = await ethersProvider._getAddress(address.toLocaleLowerCase());
		ensName = await ethersProvider.lookupAddress(checksummedAddress);
		if (!ensName) {
			return;
		} else {
			return ensName;
		}
	};

	const blockyDataUri = (urn: string) => {
		return createIcon({
			seed: urn.toLowerCase(),
			size: 8,
			scale: 16
		}).toDataURL();
	};
</script>

{#if address}
	<div class="container" {style}>
		{#if avatar}
			<img class="avatar" src={uriData} alt="user-avatar" />
		{/if}
		{#if showAddress}
			<p class="address typo-text-bold">
				{ensName ? ensName : formatAddress(address.toLocaleLowerCase())}
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
		background-color: var(--color-foreground-level-5);
	}
	.address {
		margin-left: 0.5rem;
		white-space: nowrap;
	}
</style>
