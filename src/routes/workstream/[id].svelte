<script lang="ts">
  import WorkstreamDetail from '$components/WorkstreamDetail/index.svelte';
  import { onMount } from 'svelte';
  import { headerContent } from '$lib/stores/headerContent';
  import scroll from '$lib/stores/scroll';
  import workstreamsStore from '$lib/stores/workstreams';
  import { page } from '$app/stores';

  $: enrichedWorkstream = $workstreamsStore.workstreams[$page.params.id];

  onMount(async () => {
    await workstreamsStore.fetchWorkstream($page.params.id);

    return () => {
      $headerContent = {};
    };
  });

  $: {
    $headerContent.headerContentShown = $scroll.pos > 100;
  }
</script>

<svelte:head>
  <title>{enrichedWorkstream?.data.title ?? 'Workstream'}</title>
</svelte:head>

{#if enrichedWorkstream}
  <WorkstreamDetail {enrichedWorkstream} />
{:else}
  <p>Sorry couldn't load the details of this Workstream.</p>
{/if}
