<script lang="ts">
	// import { createIcon } from '../utils/blockies.ts';

	export let address: string;
	export let style: string | undefined = undefined;
	export let size: 'small' = 'small';

	// function blockyDataUri(urn: string) {
	// 	return createIcon({
	// 		seed: urn.toLowerCase(),
	// 		size: 8,
	// 		scale: 16
	// 	}).toDataURL();
	// }
</script>

<div class="container" class:small={size === 'small'} {style}>
	<img class="avatar circle" class:small={size === 'small'} src="" alt="user-avatar" />
	<!-- <img
		class="avatar circle"
		class:small={size === 'small'}
		src={blockyDataUri(address)}
		alt="user-avatar"
	/> -->
</div>

<style>
	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-grey-darker);
	}

	.circle.small {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.75rem;
	}

	.avatar {
		display: flex;
		justify-content: center;
		align-items: center;
		user-select: none;
		flex-shrink: 0;
		background-color: var(--color-grey-dark);
	}
</style>
