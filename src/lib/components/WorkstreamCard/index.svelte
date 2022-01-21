<script lang="ts">
	import { goto } from '$app/navigation';
	export let data;
</script>

<div on:click={() => goto(`/${data.title}`)} class="card">
	<h3>{data.title}</h3>
	<p>{data.owner}</p>
	<pre>{data.type}</pre>
	<p>{data.desc}</p>
	<p>rate: {data.rate} {data.currency}/sec</p>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		border: 1px solid var(--color-primary);
	}

	.card > * {
		padding-top: 0.5rem;
	}
</style>
