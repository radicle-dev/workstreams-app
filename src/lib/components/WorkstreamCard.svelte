<script lang="ts">
  import { goto, prefetch } from '$app/navigation';
  import { hyphenateString } from '$lib/utils/format';
  import type { Workstream } from '$lib/stores/workstreams/types';

  import Card from '$components/Card.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import TitleMeta from '$components/TitleMeta.svelte';
  import TimeRate from '$components/TimeRate.svelte';
  import ActionRow from '$components/ActionRow.svelte';
  import User from '$components/User.svelte';

  export let workstream: Workstream;

  $: url = `/workstream/${hyphenateString(workstream.id)}`;
</script>

<Card on:click={() => goto(url)} on:hover={() => prefetch(url)}>
  <div slot="top">
    <TitleMeta {workstream} />
  </div>
  <div slot="bottom" class="content">
    <TimeRate {workstream} />
    <ActionRow>
      <div slot="left" class="left">
        <User address={workstream.creator} showAddress={false} />
        <p>something</p>
      </div>
      <div slot="right" class="right">
        <p>something in blue</p>
        <Button variant="primary-outline">View</Button>
      </div>
    </ActionRow>
  </div>
</Card>

<style>
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
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
