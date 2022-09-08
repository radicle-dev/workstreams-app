<script lang="ts">
  import * as modal from '$lib/utils/modal';
  import { fly } from 'svelte/transition';
  import Modal from '../Modal.svelte';
  import { onMount, type SvelteComponent } from 'svelte';
  import Spinner from 'radicle-design-system/Spinner.svelte';

  import WaitPromise from './WaitPromiseStep.svelte';
  import type { AwaitPendingPayload } from './types';

  export let stepProps: { [propName: string]: unknown } = {};
  export let steps: typeof SvelteComponent[];
  export let loading = true;

  let resolvedStepProps: { [propName: string]: unknown } | undefined;
  let currentStepIndex = 0;
  let currentStep: typeof SvelteComponent = steps[0];
  let pending: (() => Promise<void>) | undefined;
  let pendingMessage: string | undefined;

  function advance() {
    pending = undefined;

    if (steps[currentStepIndex + 1]) {
      currentStepIndex++;
      currentStep = steps[currentStepIndex];
    } else {
      modal.setHideable(true);
      modal.hide();
    }
  }

  function goBack() {
    pending = undefined;

    if (currentStep === WaitPromise) {
      currentStep = steps[currentStepIndex];
    } else if (steps[currentStepIndex - 1]) {
      currentStepIndex--;
      currentStep = steps[currentStepIndex];
    } else {
      modal.hide();
    }
  }

  function awaitPending(event: CustomEvent<AwaitPendingPayload>) {
    pending = event.detail.promise;
    pendingMessage = event.detail.message;

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
            {pendingMessage}
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
