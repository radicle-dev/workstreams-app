<script context="module" lang="ts">
  import type { Application, Workstream } from '$lib/stores/workstreams/types';
  import { getConfig } from '$lib/config';
  import connectedAndLoggedIn from '$lib/stores/connectedAndLoggedIn';

  /* eslint-disable */
  /** @type {import('./[slug]').Load} */
  export async function load({ params, fetch }) {
    const workstreamUrl = `${getConfig().API_URL_BASE}/workstreams/${
      params.id
    }`;
    const applicationsUrl = `${getConfig().API_URL_BASE}/workstreams/${
      params.id
    }/applications`;
    const fetches = [
      fetch(workstreamUrl, { credentials: 'include' }),
      fetch(applicationsUrl, { credentials: 'include' })
    ];

    const responses = await Promise.all(fetches);

    return {
      status: responses.every((e) => e.status === 200)
        ? 200
        : responses[0].status,
      props: {
        workstream: responses[0].ok && (await responses[0].json()),
        applications: responses[1].ok && (await responses[1].json())
      }
    };
  }
  /* eslint-enable */
</script>

<script lang="ts">
  import WorkstreamDetail from '$components/WorkstreamDetail.svelte';

  export let workstream: Workstream | undefined;
  export let applications: Application[] | undefined;
</script>

<svelte:head>
  <title>{workstream.title}</title>
</svelte:head>

{#if workstream}
  <WorkstreamDetail {workstream} {applications} />
{:else}
  <p>Sorry couldn't load the details of this workstream.</p>
{/if}
