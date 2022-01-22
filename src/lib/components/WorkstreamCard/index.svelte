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
	<div class="owner">
		<span>by</span>
		<User address={data.owner} />
	</div>
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
		cursor: pointer;
	}
	.card:hover {
		box-shadow: 0 0 1rem var(--color-teal-dark);
	}

	.top,
	.owner {
		display: flex;
		align-items: center;
	}

	.owner > span {
		margin-right: 0.5rem;
	}
</style>
