<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<div
	on:click={() => dispatch('click')}
	on:focus={() => dispatch('hover')}
	on:mouseover={() => dispatch('hover')}
	class="card"
>
	<div class="top">
		<slot name="top" />
	</div>
	<div class="bottom">
		<slot name="bottom" />
	</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		border: 1px solid var(--color-foreground-level-2);
		border-radius: 1rem;
		cursor: pointer;
		justify-content: space-between;
		transition: all .2s;
	}
	.card:hover {
		border: 1px solid var(--color-foreground-level-4);
	}
	.top {
		margin-bottom: 1.5rem;
	}
	.bottom {
		display: flex;
		justify-content: space-between;
	}
</style>
