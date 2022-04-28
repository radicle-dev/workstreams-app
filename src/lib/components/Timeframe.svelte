<script lang="ts">
  import { timeframeFormat } from '$lib/utils/format';

  export let duration: number;
</script>

<p class="timeframe">{timeframeFormat(duration)}</p>

<style>
  .timeframe {
    color: var(--color-foreground-level-5);
  }
</style>
