<script lang="ts">
	import * as modal from '$lib/utils/modal';
	import User from './User.svelte';
	import ApplicationDetail from './ApplicationDetail.svelte';
	import type { Application } from '$lib/types';

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
	<!-- <Tag color={tagColor(application.state)}>{application.state}</Tag> -->
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;
		padding: 1.5rem;
		border-left: 1px solid var(--color-blue-dark);
		border-right: 1px solid var(--color-blue-dark);
		border-top: 1px solid var(--color-blue-dark);
		cursor: pointer;
		justify-content: space-between;
		gap: 1rem;
	}
	.row:hover {
		box-shadow: 0 0 1rem var(--color-blue-dark);
	}
	.row:first-child {
		border-top-left-radius: 0.25rem;
		border-top-right-radius: 0.25rem;
	}
	.row:last-child {
		border-bottom-left-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
		border-bottom: 1px solid var(--color-blue-dark);
	}
	.desc {
		width: -moz-available;
	}
</style>
