<script lang="ts">
	import { format } from 'timeago.js';
	export let data;
</script>

<div class="card">
	<h3>{data.title}</h3>
	<p>{data.owner}</p>
	<p>{format(data.created)}</p>
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
