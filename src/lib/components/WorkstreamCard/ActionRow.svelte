<script lang="ts">
  import { createEventDispatcher, SvelteComponent } from 'svelte';
  import Button from 'radicle-design-system/Button.svelte';

  import Row from '$components/Row.svelte';
  import User from '$components/User.svelte';
  import FacePile from '$components/FacePile.svelte';

  export let userAddress: string | undefined = undefined;
  export let facePile: string[] | undefined = undefined;
  export let leftString = '';
  export let icon: typeof SvelteComponent | undefined = undefined;
  export let rightString: string | undefined = undefined;
  export let primaryActionText: string | undefined = undefined;
  export let outlineActionText: string | undefined = undefined;

  const dispatch = createEventDispatcher();
</script>

<Row>
  <div slot="left" class="left">
    <svelte:component this={icon} style="fill: var(--color-primary)" />
    {#if userAddress}
      <User address={userAddress} showAddress={false} />
    {/if}
    {#if facePile}
      <FacePile addresses={facePile} />
    {/if}
    <p>{leftString}</p>
  </div>
  <div slot="right" class="right">
    {#if rightString}
      <p>{rightString}</p>
    {/if}
    {#if outlineActionText}
      <Button
        variant="primary-outline"
        on:click={() => dispatch('outlineAction')}
      >
        {outlineActionText}
      </Button>
    {/if}
    {#if primaryActionText}
      <Button variant="primary" on:click={() => dispatch('primaryAction')}>
        {primaryActionText}
      </Button>
    {/if}
  </div>
</Row>

<style>
  .left,
  .right {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .right {
    color: var(--color-primary);
  }

  .icon {
    height: 1.5rem;
    width: 1.5rem;
  }
</style>
