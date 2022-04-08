<script lang="ts">
	import Button from '$components/Button.svelte';
	import User from '$components/User.svelte';
	import type { Workstream } from '$lib/types';
	export let workstream: Workstream;
</script>

<div class="row">
	<div class="left">
		<User address={workstream.creator} showAddress={false} />
		<p>something</p>
	</div>
	<div class="right">
		<p>something in blue</p>
		<Button variant="primary-outline">View</Button>
	</div>
</div>

<style>
	.row {
		display: flex;
		justify-content: space-between;
		background-color: var(--color-primary-level-1);
		border-radius: 0.5rem;
		padding: 0.75rem 0.75rem 0.75rem 1.25rem;
		margin-top: 1rem;
		align-items: center;
	}

	.left,
	.right {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.right {
		color: var(--color-primary);
	}
</style>
