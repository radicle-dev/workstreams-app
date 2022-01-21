<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import WorkstreamCard from '$lib/WorkstreamCard.svelte';

	let workstreams = [
		{
			timeframe: 1641458535,
			currency: 'DAI',
			title: 'Rinkeby faucet',
			desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
			owner: '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471',
			type: 'grant',
			rate: 1.1
		},
		{
			timeframe: 1641458535,
			currency: 'DAI',
			title: 'other stream',
			desc: 'Doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
			owner: '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471',
			type: 'role',
			rate: 2
		},
		{
			timeframe: 1641458535,
			currency: 'DAI',
			title: 'other stream',
			desc: 'Lorem ipsum dolor',
			owner: '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471',
			type: 'role',
			rate: 2
		},
		{
			timeframe: 1641458535,
			currency: 'DAI',
			title: 'Rinkeby faucet',
			desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
			owner: '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471',
			type: 'grant',
			rate: 1.1
		},
		{
			timeframe: 1641458535,
			currency: 'DAI',
			title: 'other stream',
			desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
			owner: '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471',
			type: 'role',
			rate: 2
		},
		{
			timeframe: 1641458535,
			currency: 'DAI',
			title: 'other stream',
			desc: '',
			owner: '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471',
			type: 'role',
			rate: 2
		}
	];
</script>

<svelte:head>
	<title>Workstreams · Overview</title>
</svelte:head>

<section>
	<div class="overview">
		{#each workstreams as workstream}
			<WorkstreamCard data={workstream} />
		{/each}
	</div>
</section>

<style>
	.overview {
		padding: 2rem 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}
</style>
