<script lang="ts">
	import { get } from 'svelte/store';
	import { providerStore } from 'web3-stores';
	import { workstreamStore } from '$lib/stores/workstreamsStore.js';
	const workstreams = get(workstreamStore);

	import Modal from '$lib/shared/Modal.svelte';
	import User from '$lib/shared/User.svelte';

	export let application;
	let workstream;

	function getWorkstream() {
		return (workstream = workstreams.find(
			(workstream) => workstream.id === application.workstream_id
		));
	}
	getWorkstream();
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
