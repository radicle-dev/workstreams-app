<script lang="ts">
	import { goto } from '$app/navigation';
	export let data;
</script>

<div on:click={() => goto(`/${data.name}`)} class="card">
	<h3>{data.name}</h3>
	<p>owner: {data.owner}</p>
	<pre>{data.type}</pre>
	<p>rate: {data.rate}/sec</p>
</div>