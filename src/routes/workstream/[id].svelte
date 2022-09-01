<script context="module" lang="ts">
  import type { Workstream } from '$lib/stores/workstreams/types';

  /* eslint-disable */
  /** @type {import('./[slug]').Load} */
  export async function load({ params, fetch }) {
    const res = await workstreamsStore.getWorkstream(params.id, fetch);

    return {
      status: res.ok ? '200' : '500',
      props: {
        workstream: res.ok && res.data
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
  import { workstreamsStore } from '$lib/stores/workstreams';
  import scroll from '$lib/stores/scroll';

  export let workstream: Workstream | undefined;

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
  <WorkstreamDetail {workstream} />
{:else}
  <p>Sorry couldn't load the details of this Workstream.</p>
{/if}
