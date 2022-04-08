<script lang="ts">
	import { timeframeFormat } from '$lib/utils/format';

	export let starting: number;
	export let ending: number;
</script>

<p class="timeframe">{timeframeFormat(starting, ending)}</p>

<style>
	.timeframe {
		color: var(--color-foreground-level-5);
	}
</style>
