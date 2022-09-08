<script lang="ts">
  import { dateFormat } from '$lib/utils/format';

  import ActiveStream from './ActiveStream.svelte';
  import User from '$components/User.svelte';
  import Markdown from 'radicle-design-system/Markdown.svelte';
  import type { EnrichedWorkstream } from '$lib/stores/workstreams';

  export let enrichedWorkstream: EnrichedWorkstream;
</script>

<div class="container">
  <div class="metadata">
    <h1 class="inset" style="margin-bottom: 0.75rem;">
      {enrichedWorkstream.data.title}
    </h1>
    <div class="inset owner">
      <span class="label">Created by</span>
      <User address={enrichedWorkstream.data.creator} />
      <span class="label"
        >on {dateFormat(enrichedWorkstream.data.createdAt)}</span
      >
    </div>
    <div class="cards">
      <ActiveStream {enrichedWorkstream} />
      <div />
    </div>
    <div class="desc">
      <Markdown content={enrichedWorkstream.data.description} />
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 54rem;
    margin: 0 auto;
    width: 100%;
    padding: 1rem 0 0 0;
  }

  .inset {
    padding: 0 1rem 0 1rem;
  }
  .metadata > * {
    margin-bottom: 2rem;
  }
  .owner {
    display: flex;
    align-items: center;
    color: var(--color-foreground-level-6);
    flex-wrap: wrap;
    column-gap: 0.5rem;
  }

  .cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .desc {
    margin-top: 2rem;
    color: var(--color-foreground);
    user-select: text;
    padding: 1rem;
  }
</style>
