<script lang="ts">
	import { providerStore } from 'web3-stores';
	import * as modal from '$lib/utils/modal';
	import Spinner from '../Spinner.svelte';
</script>

<span class="emoji">👔</span>
<h3>Create a work stream</h3>
{#if !$providerStore.connected}
	<p>Please sign in your connected wallet</p>
{/if}
<Spinner style="display: flex;justify-content: center;" />
<div class="actions">
	<button class="transparent" label="Done" on:click={() => modal.hide()}>Done</button>
</div>

<style>
	h3 {
		margin: 1rem 0;
	}
	p {
		color: var(--color-teal);
	}
	p:first-of-type {
		margin-bottom: 2rem;
	}
	.actions {
		display: flex;
		justify-content: center;
		padding-top: 0.5rem;
		margin: 2rem 0 0;
		gap: 0.75rem;
	}
</style>
