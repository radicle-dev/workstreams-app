<script context="module" lang="ts">
	import type { Application, Workstream } from '$lib/stores/workstreams/types';
	import { getConfig } from '$lib/config';

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
	import { onMount } from "svelte";
	import WorkstreamDetail from '$components/WorkstreamDetail.svelte';
import { walletStore } from '$lib/stores/wallet/wallet';
import { authStore } from '$lib/stores/auth/auth';

	export let workstream: Workstream | undefined;

	let application: Application | undefined;

	$: connectedAndLoggedIn =
		$walletStore.connected &&
		$authStore.authenticated &&
		$walletStore.address === $authStore.address;

	onMount(async () => {
		if (!workstream || !connectedAndLoggedIn) return;

		const applicationRequest = await fetch(
			`${getConfig().API_URL_BASE}/workstreams/${workstream.id}/applications`,
			{
				credentials: 'include',
			},
		);

		application = (await applicationRequest.json())[0];

		console.log(application);
	});
</script>

<svelte:head>
	<title>{workstream.title}</title>
</svelte:head>

{#if workstream}
	<!-- TODO: Temporarily just printing the JSON here -->
	{#if application && connectedAndLoggedIn}
	 {JSON.stringify(application)}
	{/if}
	<WorkstreamDetail {workstream} />
{:else}
	<p>Sorry couldn't load the details of this workstream.</p>
{/if}
