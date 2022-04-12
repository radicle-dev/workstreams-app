<script lang="ts">
	import { onMount } from 'svelte';
	import { providerStore } from 'web3-stores';
	import workstreamsStore from '$lib/stores/workstreams';

	import type { Application, Workstream } from '$lib/stores/types';

	import Modal from '$components/Modal.svelte';
	import User from '$components/User.svelte';

	export let application: Application;
	let workstream: Workstream;

	onMount(async () => {
		workstream = await workstreamsStore.fetchOne(application.workstream_id);
	});

	$: isCreator =
		$providerStore.connected && $providerStore.accounts[0] === workstream.creator.toLowerCase();
</script>

<Modal style="text-align: left;">
	<div slot="body">
		<h4>{application.title}</h4>
		<div class="owner">
			<span>by</span>
			<User address={application.creator} />
		</div>
		<p>{application.desc}</p>
		{#if isCreator}
			<div class="actions">
				<button>Reject</button>
				<button>Accept</button>
			</div>
		{/if}
	</div>
</Modal>

<style>
	.owner {
		display: flex;
		align-items: center;
	}
</style>
