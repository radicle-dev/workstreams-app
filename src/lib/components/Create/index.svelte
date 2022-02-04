<script lang="ts">
	import Modal from '$lib/shared/Modal.svelte';
	import Step1 from './Step1.svelte';
	import Step2 from './Step2.svelte';
	import Step3 from './Step3.svelte';

	let type = 'grant';
	let steps = 1;
	let title: string;
	let rate: string;
	let desc: string;
	let roleStart: string;
	let grantDuration: string;
</script>

<Modal>
	<div slot="body">
		{#if steps === 1}
			<Step1
				{type}
				on:nextAction={() => {
					steps = steps + 1;
				}}
			/>
		{:else if steps === 2}
			<Step2
				{type}
				{title}
				{rate}
				{desc}
				{roleStart}
				{grantDuration}
				on:backAction={() => {
					steps = steps - 1;
				}}
				on:nextAction={() => {
					steps = steps + 1;
				}}
			/>
		{:else if steps === 3}
			<Step3 />
		{/if}
	</div>
</Modal>
