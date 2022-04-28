<div class="row">
  <slot name="left" />
  <slot name="right" />
</div>

<style>
  .row {
    display: flex;
    justify-content: space-between;
    background-color: var(--color-primary-level-1);
    border-radius: 0.5rem;
    padding: 0.75rem 0.75rem 0.75rem 1.25rem;
    margin-top: 1rem;
    align-items: center;
  }

  .row:first-child {
    margin-top: 0;
  }
</style>
