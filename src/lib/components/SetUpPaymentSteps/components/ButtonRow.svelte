<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from 'radicle-design-system/Button.svelte';

  const dispatch = createEventDispatcher();

  export let buttonText = 'Continue';
  export let disabled = false;
  export let primaryAction: () => void = () => dispatch('continue');
</script>

<div class="button-row">
  <Button {disabled} on:click={primaryAction}>{buttonText}</Button>
</div>

<style>
  .button-row {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
</style>
