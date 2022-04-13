<script lang="ts">
	export let rate: number;
	export let currency: string;
</script>

<p class="typo-text-bold rate">
	{Math.floor(rate * 24)}
	{currency} <span class="typo-regular">/ day</span>
</p>

<style>
	.rate {
		color: var(--color-primary);
	}
</style>
