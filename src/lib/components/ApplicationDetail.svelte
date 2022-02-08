<script lang="ts">
	import Modal from '$components/Modal.svelte';
	import User from '$components/User.svelte';
	import type { Application } from '$lib/types';

	export let application: Application;
</script>

<Modal>
	<div slot="body">
		<h4>{application.title}</h4>
		<User address={application.creator} />
		<p>{application.desc}</p>
	</div>
</Modal>
