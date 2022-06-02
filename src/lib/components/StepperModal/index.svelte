<script lang="ts">
  import * as modal from '$lib/utils/modal';
  import { fly } from 'svelte/transition';
  import Modal from '../Modal.svelte';
  import { onMount, type SvelteComponent } from 'svelte';
  import Spinner from 'radicle-design-system/Spinner.svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import WaitPromise from './WaitPromiseStep.svelte';

  export let stepProps: { [propName: string]: any } = {};
  export let steps: typeof SvelteComponent[];
  export let loading = true;

  let resolvedStepProps: { [propName: string]: any } | undefined;
  let currentStepIndex = 0;
  let currentStep: typeof SvelteComponent = steps[0];
  let pending: () => Promise<void> | undefined;

  function advance() {
    pending = undefined;

    if (steps[currentStepIndex + 1]) {
      currentStepIndex++;
      currentStep = steps[currentStepIndex];
    } else {
      modal.hide();
      goto($page.url.pathname);
    }
  }

  function goBack() {
    pending = undefined;

    if (steps[currentStepIndex - 1]) {
      currentStepIndex--;
      currentStep = steps[currentStepIndex];
    } else {
      modal.hide();
      goto($page.url.pathname);
    }
  }

  function awaitPending(event: CustomEvent) {
    pending = event.detail;
    currentStep = WaitPromise;
  }

  async function resolveStepPropPromises() {
    loading = true;

    const resolved = await Promise.all(
      Object.entries(stepProps).map(async ([key, value]) => [key, await value])
    );

    resolvedStepProps = Object.fromEntries(resolved);

    loading = false;
  }

  onMount(resolveStepPropPromises);
</script>

<Modal>
  <div slot="body" class="body">
    {#if !loading}
      {#key currentStep}
        <div in:fly={{ x: 50 }} out:fly={{ x: -50 }} class="content">
          <svelte:component
            this={currentStep}
            {...resolvedStepProps}
            {pending}
            on:continue={advance}
            on:goBack={goBack}
            on:awaitPending={awaitPending}
          />
        </div>
      {/key}
      <!--
        Placeholder to get the modal to be the right height. 
        TODO: Rendering the component twice is an insane solution and
        dangerous since mounting it may have side effects. We should
        be on the lookout for a better solution.
      -->
      <div class="placeholder">
        <svelte:component this={currentStep} {...resolvedStepProps} />
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