<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Button from 'radicle-design-system/Button.svelte';
  import Emoji from './Emoji.svelte';
  import Tooltip from 'radicle-design-system/Tooltip.svelte';

  const dispatch = createEventDispatcher();

  export let style: string | undefined = undefined;
  export let emoji = '🪴';
  export let text: string | undefined = undefined;
  export let headerText: string | undefined = undefined;
  export let primaryActionText: string | undefined = undefined;
  export let secondaryActionText: string | undefined = undefined;
  export let primaryActionDisabled = false;
  export let primaryActionTooltipMessage: string | undefined = undefined;

  $: tooltipMessage = primaryActionDisabled ? primaryActionTooltipMessage : '';
</script>

<div class="empty-state" data-cy="empty-state" {style}>
  {#if emoji}
    <Emoji {emoji} size="huge" />
  {/if}
  {#if headerText}
    <h3>{headerText}</h3>
  {/if}
  {#if text}
    <p class="text">{text}</p>
  {/if}
  {#if primaryActionText}
    <Tooltip value={tooltipMessage} position="top">
      <Button
        disabled={primaryActionDisabled}
        dataCy="primary-action"
        on:click={() => dispatch('primaryAction')}
      >
        {primaryActionText}
      </Button>
    </Tooltip>
  {/if}
  {#if secondaryActionText}
    <button
      data-cy="secondary-action"
      style="margin-top: 0.5rem;"
      on:click={() => dispatch('secondaryAction')}
    >
      {secondaryActionText}
    </button>
  {/if}
  <div style="margin: 1.5rem;">
    <slot />
  </div>
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - var(--bigheader-height));
    text-align: center;
    max-width: 30rem;
    margin: 0 auto;
  }
  h3 {
    margin-top: 1.8rem;
  }
  .text {
    color: var(--color-foreground-level-6);
    margin-top: 1.5rem;
    max-width: 20rem;
    margin-bottom: 16px;
  }
</style>
