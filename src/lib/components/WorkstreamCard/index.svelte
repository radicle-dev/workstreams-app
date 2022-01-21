<script lang="ts">
	import { goto } from '$app/navigation';
	import Tag from '../../shared/Tag.svelte';
	import User from '../../shared/User.svelte';
	export let data;
</script>

<div on:click={() => goto(`/${data.title}`)} class="card">
	<div class="top">
		<h4>{data.title}</h4>
		<Tag>{data.type}</Tag>
	</div>
	<p>by <User address={data.owner} /></p>
	<p>{data.desc}</p>
	<p>rate: {data.rate} {data.currency}/sec</p>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		border: 1px solid var(--color-teal-dark);
		border-radius: 0.25rem;
	}

	.card > * {
		padding-bottom: 0.5rem;
	}

	.top {
		display: flex;
		align-items: center;
	}
</style>
