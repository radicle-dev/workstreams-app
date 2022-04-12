<script lang="ts">
	import * as modal from '$lib/utils/modal';
	import User from '$components/User.svelte';
	import Tag from '$components/Tag.svelte';
	import ApplicationDetail from '$components/ApplicationDetail.svelte';
	import type { Application } from '$lib/stores/workstreams/types';

	export let owner = false;
	export let application: Application;

	const tagColor = (state: string) => {
		if (state === 'accepted') {
			return 'green';
		} else if (state === 'pending') {
			return 'yellow';
		} else if (state === 'rejected') {
			return 'red';
		}
	};
</script>

<div on:click={() => modal.toggle(ApplicationDetail, () => null, { application })} class="row">
	<User address={application.creator} showAddress={!owner} />
	<p class="desc typo-overflow-ellipsis">{application.desc}</p>
	<Tag>{application.state}</Tag>
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;
		padding: 1.5rem;
		border-left: 1px solid var(--color-primary-level-1);
		border-right: 1px solid var(--color-primary-level-1);
		border-top: 1px solid var(--color-primary-level-1);
		cursor: pointer;
		justify-content: space-between;
		gap: 1rem;
	}
	.row:hover {
		box-shadow: 0 0 1rem var(--color-primary-level-1);
	}
	.row:first-child {
		border-top-left-radius: 0.25rem;
		border-top-right-radius: 0.25rem;
	}
	.row:last-child {
		border-bottom-left-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
		border-bottom: 1px solid var(--color-primary-level-1);
	}
	.desc {
		width: -moz-available;
	}
</style>
