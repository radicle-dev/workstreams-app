<script lang="ts">
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import ButtonRow from '../components/ButtonRow.svelte';
</script>

<div>
  <Emoji emoji="💸" size="large" />
  <h1>Set up payment stream</h1>
  <div class="left-align">
    <h4>Here's how this works:</h4>
    <ol>
      <li>1. Create the stream & top up it up with an initial amount.</li>
      <li>
        2. Funds starts streaming at the predefined rate until your initial top
        up runs out.
      </li>
      <li>3. Top up the balance to resume streaming.</li>
    </ol>
    <p>If you want to pause a stream, you can drain the topped up amount.</p>
  </div>
  <ButtonRow buttonText="Continue" on:continue />
</div>

<style>
  h1 {
    margin: 1rem 0 2rem;
    color: var(--color-foreground);
  }

  li {
    margin-bottom: 0.25rem;
  }

  .left-align {
    text-align: left;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .left-align > * {
    width: 100%;
    color: var(--color-foreground-level-6);
  }
</style>
