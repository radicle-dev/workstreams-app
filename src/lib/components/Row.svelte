<script lang="ts">
  export let color = 'var(--color-primary-level-1)';
</script>

<div class="row" style={`background-color: ${color}`}>
  <slot name="left" />
  <slot name="right" />
</div>

<style>
  .row {
    display: flex;
    justify-content: space-between;
    border-radius: 0.5rem;
    padding: 0.75rem 0.75rem 0.75rem 1.25rem;
    margin-top: 1rem;
    align-items: center;
    height: 4rem;
  }

  .row:first-child {
    margin-top: 0;
  }
</style>
