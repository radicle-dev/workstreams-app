<h1>
  <slot name="headline" />
</h1>
<div class="content">
  <slot name="content" />
</div>
<div>
  <slot name="step-actions" />
</div>

<style>
  h1,
  .content {
    margin-bottom: 2rem;
  }

  /* https://github.com/sveltejs/svelte/issues/4443#issuecomment-736767893 */
  :global([slot='step-actions']) {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
</style>
