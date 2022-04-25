<script lang="ts">
	export let rate: number;
	export let currency: string;
	export let difference: boolean = false;
</script>

<p class="typo-text-bold rate" class:difference>
	{#if difference}
		<span>+ </span>
	{/if}
	{Math.floor(rate)}
	{currency.toUpperCase()} <span class="typo-text">/ 24h</span>
</p>

<style>
	.rate {
		color: var(--color-primary);
	}
	.rate.difference {
		color: var(--color-negative);
	}
</style>
