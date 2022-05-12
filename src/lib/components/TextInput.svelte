<script lang="ts">
  import CheckCircleIcon from 'radicle-design-system/icons/CheckCircle.svelte';
  import ExclamationCircleIcon from 'radicle-design-system/icons/ExclamationCircle.svelte';

  import KeyHint from 'radicle-design-system/KeyHint.svelte';
  import Spinner from 'radicle-design-system/Spinner.svelte';

  type TextInputValidationState =
    | { type: 'unvalidated' }
    | { type: 'pending' }
    | { type: 'valid' }
    | { type: 'invalid'; message: string };

  export let textarea = false;
  export let number = false;

  export let autofocus = false;
  export let disabled = false;
  export let readonly = false;
  export let showSuccessCheck = false;

  export let dataCy: string | undefined = undefined;
  export let inputStyle: string | undefined = undefined;
  export let style: string | undefined = undefined;

  export let value: string | number | undefined = undefined;
  export let placeholder: string | undefined = undefined;

  export let hint: string | undefined = undefined;
  export let suffix: string | undefined = undefined;

  export let validationState: TextInputValidationState = {
    type: 'unvalidated'
  };

  export const focus = (): void => {
    inputElement && inputElement.focus();
  };

  let inputElement: HTMLInputElement | HTMLTextAreaElement | undefined =
    undefined;

  // Can't use normal `autofocus` attribute on the `inputElement`: "Autofocus
  // processing was blocked because a document's URL has a fragment".
  // preventScroll is necessary for onboarding animations to work.
  $: if (autofocus) {
    inputElement && inputElement.focus({ preventScroll: true });
  }

  let rightContainerWidth: number;
</script>

<div {style} class="wrapper">
  {#if textarea}
    <textarea
      style={`${inputStyle}; padding-right: ${
        rightContainerWidth ? `${rightContainerWidth}px` : 'auto'
      };`}
      class:invalid={validationState.type === 'invalid'}
      data-cy={dataCy}
      {placeholder}
      {disabled}
      {readonly}
      spellcheck={false}
      bind:value
      bind:this={inputElement}
      on:change
      on:click
      on:input
      on:keydown
      on:keypress
    />
  {:else if number}
    <input
      style={`${inputStyle}; padding-right: ${
        rightContainerWidth ? `${rightContainerWidth}px` : 'auto'
      };`}
      type="number"
      class:invalid={validationState.type === 'invalid'}
      data-cy={dataCy}
      {placeholder}
      {disabled}
      {readonly}
      spellcheck={false}
      bind:value
      bind:this={inputElement}
      on:change
      on:click
      on:input
      on:keydown
      on:keypress
    />
  {:else}
    <input
      style={`${inputStyle}; padding-right: ${
        rightContainerWidth ? `${rightContainerWidth}px` : 'auto'
      };`}
      class:invalid={validationState.type === 'invalid'}
      data-cy={dataCy}
      {placeholder}
      {disabled}
      {readonly}
      spellcheck={false}
      bind:value
      bind:this={inputElement}
      on:change
      on:click
      on:input
      on:keydown
      on:keypress
    />
  {/if}

  <div class="right-container" bind:clientWidth={rightContainerWidth}>
    {#if hint && (validationState.type === 'unvalidated' || validationState.type === 'valid')}
      <KeyHint style="margin: 0 0.5rem;">{hint}</KeyHint>
    {/if}

    {#if suffix}
      <span
        style="font-family: var(--typeface-mono-bold); color: var(--color-foreground-level-5); margin: 0 0.5rem;"
      >
        {suffix}
      </span>
    {/if}

    {#if validationState.type === 'pending'}
      <Spinner style="margin: 0 0.5rem;" />
    {:else if showSuccessCheck && validationState.type === 'valid'}
      <CheckCircleIcon style="fill: var(--color-positive); margin: 0 0.5rem;" />
    {:else if validationState.type === 'invalid'}
      <ExclamationCircleIcon
        dataCy="validation-error-icon"
        style="fill: var(--color-negative); margin: 0 0.5rem;"
      />
    {/if}
  </div>

  {#if validationState.type === 'invalid'}
    <div class="validation-message">
      {validationState.message}
    </div>
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
  }

  input,
  textarea {
    background-color: var(--color-background);
    border-radius: 0.5rem;
    border: 1px solid var(--color-foreground-level-3);
    height: 2.5rem;
    padding: 0.5rem 0.75rem;
    width: 100%;
    color: var(--foreground);
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  input[disabled],
  textarea[disabled] {
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground-level-4);
    cursor: not-allowed;
  }

  input[disabled]::placeholder,
  textarea[disabled]::placeholder {
    color: var(--color-foreground-level-4);
  }

  input[disabled]:hover,
  textarea[disabled]:hover {
    background-color: var(--color-foreground-level-1);
  }

  input[readonly]:hover,
  textarea[readonly]:hover {
    cursor: pointer;
  }

  .right-container {
    align-items: center;
    display: flex;
    height: 2.5rem;
    position: absolute;
    right: 0;
    top: 0;
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--color-foreground-level-5);
  }

  input:focus,
  input:hover,
  textarea:focus,
  textarea:hover {
    background-color: var(--color-foreground-level-1);
    border: 1px solid var(--color-foreground-level-3);
    outline: none;
  }

  input.invalid:focus,
  input.invalid,
  textarea.invalid:focus,
  textarea.invalid {
    background-position: right 0.875rem top 55%;
    background: var(--color-background);
    border: 1px solid var(--color-negative);
    outline: none;
  }

  input.invalid:focus,
  textarea.invalid:focus {
    background: var(--color-foreground-level-1);
  }

  .validation-message {
    align-items: center;
    color: var(--color-negative);
    display: flex;
    margin-top: 0.75rem;
    text-align: left;
  }
</style>
