<script lang="ts">
	import * as modal from '$lib/utils/modal';
	import type { Application } from '$lib/stores/workstreams/types';
	export let application: Application;

	import Modal from '$components/Modal.svelte';
</script>

<Modal>
	<div slot="body">
		{JSON.stringify(application)}
	</div>
</Modal>

<style>
</style>
