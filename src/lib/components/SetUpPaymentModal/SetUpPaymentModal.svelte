<script lang="ts">
  import drips from '$lib/stores/drips';
  import { fly } from 'svelte/transition';
  import Modal from '../Modal.svelte';
  import type { Application, Workstream } from '$lib/stores/workstreams/types';
  import { onMount, SvelteComponent } from 'svelte';
  import Spinner from 'radicle-design-system/Spinner.svelte';

  import Intro from './steps/Intro.svelte';
  import ConfirmValues from './steps/ConfirmValues.svelte';
  import SetDaiAllowance from './steps/SetDaiAllowance.svelte';

  export let application: Application | Promise<Application>;
  export let workstream: Workstream;

  let resolvedApplication: Application | undefined;

  const steps: typeof SvelteComponent[] = [
    Intro,
    SetDaiAllowance,
    ConfirmValues
  ];

  let currentStepIndex = 0;

  onMount(async () => {
    resolvedApplication = await application;
  });
</script>

<Modal>
  <div slot="body" class="body">
    {#if resolvedApplication}
      {#key currentStepIndex}
        <div in:fly={{ x: 50 }} out:fly={{ x: -50 }} class="content">
          <svelte:component
            this={steps[currentStepIndex]}
            {workstream}
            {application}
            on:continue={() => currentStepIndex++}
          />
        </div>
      {/key}
      <!-- Placeholder to get the modal to be the right height. -->
      <div class="placeholder">
        <svelte:component
          this={steps[currentStepIndex]}
          {workstream}
          {application}
        />
      </div>
    {:else}
      <Spinner />
    {/if}
  </div>
</Modal>

<style>
  .body {
    position: relative;
  }

  .content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .placeholder {
    pointer-events: none;
    opacity: 0;
  }
</style>
