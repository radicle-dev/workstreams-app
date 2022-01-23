<script lang="ts">
	import Tag from '../../shared/Tag.svelte';
	import User from '../../shared/User.svelte';

	export let workstream;
</script>

<div class="top">
	<h2>{workstream.title}</h2>
	<Tag>{workstream.type}</Tag>
</div>
<div class="owner">
	<span>by</span>
	<User address={workstream.owner} />
</div>
<p>{workstream.desc}</p>
<p>rate: {workstream.rate} {workstream.currency}/sec</p>

<style>
	.top,
	.owner {
		display: flex;
		align-items: center;
	}

	.owner > span {
		margin-right: 0.5rem;
	}
</style>
