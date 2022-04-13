<script>
  import { fly } from "svelte/transition";
  export let url = "";
</script>

{#key url}
  <div
    in:fly={{ y: 10, duration: 300, delay: 300 }}
    out:fly={{ y: 10, duration: 300 }}
  >
    <slot />
  </div>
{/key}
