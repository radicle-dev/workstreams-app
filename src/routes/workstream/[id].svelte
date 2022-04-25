<script context="module" lang="ts">
	import type { Application, Workstream } from '$lib/stores/workstreams/types';
	import { getConfig } from '$lib/config';
	import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

	/* eslint-disable */
	/** @type {import('./[slug]').Load} */
	export async function load({ params, fetch }) {
		const url = `${getConfig().API_URL_BASE}/workstreams/${params.id}`;
		const response = await fetch(url, { credentials: 'include' });

		return {
			status: response.status,
			props: {
				workstream: response.ok && (await response.json())
			}
		};
	}
	/* eslint-enable */
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import WorkstreamDetail from '$components/WorkstreamDetail.svelte';

	export let workstream: Workstream | undefined;

	let applications: Application[] | undefined;

	onMount(async () => {
		if (!workstream || !$connectedAndLoggedIn) return;

		const applicationsRequest = await fetch(
			`${getConfig().API_URL_BASE}/workstreams/${workstream.id}/applications`
		);

		applications = await applicationsRequest.json();
	});
</script>

<svelte:head>
	<title>{workstream.title}</title>
</svelte:head>

{#if workstream}
	<WorkstreamDetail {workstream} {applications} />
{:else}
	<p>Sorry couldn't load the details of this workstream.</p>
{/if}
