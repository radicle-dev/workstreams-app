<script lang="ts">
	import { page } from '$app/stores';
	import Protected from '@components/Protected/index.svelte';
	import WorkstreamDetail from '@components/WorkstreamDetail/index.svelte';
</script>

<svelte:head>
	<title>Workstream</title>
</svelte:head>

<Protected>
	<WorkstreamDetail id={$page.params.id} />
</Protected>
