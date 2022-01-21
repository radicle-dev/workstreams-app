<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Protected from '@components/Protected/index.svelte';
	import WorkstreamCard from '@components/WorkstreamCard/index.svelte';

	let workstreams = [
		{
			created: 1641458535,
			currency: 'DAI',
			title: 'Rinkeby faucet',
			desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
			owner: 'address.eth',
			type: 'grant',
			rate: 1.1
		},
		{
			created: 1641458535,
			currency: 'DAI',
			title: 'other stream',
			desc: 'Doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
			owner: 'address.eth',
			type: 'role',
			rate: 2
		},
		{
			created: 1641458535,
			currency: 'DAI',
			title: 'other stream',
			desc: 'Lorem ipsum dolor',
			owner: 'address.eth',
			type: 'role',
			rate: 2
		},
		{
			created: 1641458535,
			currency: 'DAI',
			title: 'Rinkeby faucet',
			desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
			owner: 'address.eth',
			type: 'grant',
			rate: 1.1
		},
		{
			created: 1641458535,
			currency: 'DAI',
			title: 'other stream',
			desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
			owner: 'address.eth',
			type: 'role',
			rate: 2
		},
		{
			created: 1641458535,
			currency: 'DAI',
			title: 'other stream',
			desc: '',
			owner: 'address.eth',
			type: 'role',
			rate: 2
		}
	];
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<Protected>
	<section>
		<div class="overview">
			{#each workstreams as workstream}
				<WorkstreamCard data={workstream} />
			{/each}
		</div>
	</section>
</Protected>

<style>
	.overview {
		padding: 2rem 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.5rem;
	}
</style>
