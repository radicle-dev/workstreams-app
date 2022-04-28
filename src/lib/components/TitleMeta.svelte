<script lang="ts">
  import User from '$components/User.svelte';
  import Badge from 'radicle-design-system/Badge.svelte';

  export let title: string;
  export let type: string;
  export let creator: string;
</script>

<div class="title">
  <h3 style="margin-right: 0.75rem;" class="typo-overflow-ellipsis">{title}</h3>
  <Badge style="font-weight: 600;" text={type} />
</div>
<div class="owner">
  <User address={creator} />
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
