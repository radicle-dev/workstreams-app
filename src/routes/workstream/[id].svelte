<script context="module" lang="ts">
  import type { Application, Workstream } from '$lib/stores/workstreams/types';
  import { getConfig } from '$lib/config';

  /* eslint-disable */
  /** @type {import('./[slug]').Load} */
  export async function load({ params, fetch }) {
    const applicationsUrl = `${getConfig().API_URL_BASE}/workstreams/${
      params.id
    }/applications`;

    const fetches = [
      workstreamsStore.getWorkstream(params.id, fetch),
      fetch(applicationsUrl, { credentials: 'include' })
    ];

    const responses = await Promise.all(fetches);

    return {
      status: responses.every((r) => r.ok) ? 200 : responses[0].status,
      props: {
        workstream: responses[0].ok && responses[0].data,
        applications:
          responses[1].ok && JSON.parse(await responses[1].text(), reviver)
      }
    };
  }
  /* eslint-enable */
</script>

<script lang="ts">
  import WorkstreamDetail from '$components/WorkstreamDetail/index.svelte';
  import { onMount } from 'svelte';
  import { headerContent } from '$lib/stores/headerContent';
  import WorkstreamPageHeader from '$lib/components/WorkstreamPageHeader.svelte';
  import { reviver, workstreamsStore } from '$lib/stores/workstreams';
  import scroll from '$lib/stores/scroll';

  export let workstream: Workstream | undefined;
  export let applications: Application[] | undefined;

  onMount(() => {
    $headerContent = {
      component: WorkstreamPageHeader,
      props: { workstream },
      headerContentShown: false
    };

    return () => {
      $headerContent = {};
    };
  });

  $: {
    $headerContent.headerContentShown = $scroll.pos > 100;
  }
</script>

<svelte:head>
  <title>{workstream.title}</title>
</svelte:head>

{#if workstream}
  <WorkstreamDetail {workstream} {applications} />
{:else}
  <p>Sorry couldn't load the details of this Workstream.</p>
{/if}
