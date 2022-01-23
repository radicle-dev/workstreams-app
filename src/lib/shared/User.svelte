<script lang="ts">
	import { ethers } from 'ethers';
	const provider = ethers.getDefaultProvider();
	import { createIcon } from '../utils/blockies.ts';
	import { onMount } from 'svelte';

	export let style: string | undefined = undefined;
	export let address: string;
	export let avatar: boolean = true;

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

	function formatAddress(input: string): string {
		const addr = ethers.utils.getAddress(input).replace(/^0x/, '');
		return addr.substring(0, 4) + ' – ' + addr.substring(addr.length - 4, addr.length);
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
			<img class="avatar circle" src={uriData} alt="user-avatar" />
		{/if}
		<p class="typo-text-bold">
			{ensName === null ? formatAddress(address) : ensName}
		</p>
	</div>
{/if}

<style>
	.container {
		display: flex;
		align-items: center;
	}
	.circle {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.75rem;
	}

	.avatar {
		display: flex;
		justify-content: center;
		align-items: center;
		user-select: none;
		flex-shrink: 0;
		background-color: var(--color-grey-dark);
		margin-right: 0.5rem;
	}
</style>
