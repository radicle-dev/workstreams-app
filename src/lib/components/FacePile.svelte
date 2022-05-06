<script lang="ts">
  import User from '$components/User.svelte';
  export let addresses: string[];
</script>

<div class="pile">
  {#each addresses as address}
    <User style="margin-right: -0.5rem;" {address} showAddress={false} />
  {/each}
</div>

<style>
  .pile {
    display: flex;
    flex-direction: row;
    margin-right: 0.5rem;
  }
</style>
