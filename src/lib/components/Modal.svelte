<script lang="ts">
  export let style: string = undefined;
</script>

<div class="modal" {style}>
  <slot name="body" />
</div>

<style>
  .modal {
    padding: 2.5rem;
    background: var(--color-background);
    border-radius: 1rem;
    box-shadow: var(--elevation-high);
    width: 70vw;
    max-width: 40rem;
    text-align: center;
    overflow: hidden;
  }

  @media only screen and (max-width: 54rem) {
    .modal {
      width: 95vw;
      padding: 1rem;
    }
  }
</style>
