<script lang="ts">
	import Modal from '$lib/shared/Modal.svelte';
	import User from '$lib/shared/User.svelte';
	export let application;
</script>

<Modal>
	<div slot="body">
		<h4>{application.title}</h4>
		<User address={application.creator} />
		<p>{application.desc}</p>
	</div>
</Modal>
