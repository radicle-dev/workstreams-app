<script lang="ts">
	export let data;
</script>

<div class="card">
	<h3>{data.name}</h3>
	<p>owner: {data.owner}</p>
	<pre>{data.type}</pre>
	<p>rate: {data.rate}/sec</p>
</div>
