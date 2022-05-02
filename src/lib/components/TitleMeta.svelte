<script lang="ts">
	import type { Workstream } from '$lib/stores/workstreams/types';
	import User from '$components/User.svelte';
	export let workstream: Workstream;
</script>

<div class="title">
	<h3 style="margin-right: 0.75rem;" class="typo-overflow-ellipsis">{workstream.title}</h3>
</div>
<div class="owner">
	<User address={workstream.creator} />
</div>

<style>
	.title,
	.owner {
		display: flex;
		align-items: center;
	}
	.title {
		margin-bottom: 0.5rem;
		justify-content: space-between;
	}
</style>
