<script lang="ts">
  import * as modal from '$lib/utils/modal';
  import Modal from '$components/Modal.svelte';
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import Dropdown from 'radicle-design-system/Dropdown.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import TextArea from 'radicle-design-system/TextArea.svelte';
  import { getConfig } from '$lib/config';
  import type { WorkstreamInput } from '$lib/stores/workstreams/types';
  import { goto } from '$app/navigation';
  import { utils } from 'ethers';

  const durationOptions = [
    { value: '1', title: 'Days' },
    { value: '7', title: 'Weeks' },
    { value: '30', title: 'Months' },
    { value: '365', title: 'Years' }
  ];

  let title: string;
  let total: string;
  let duration: string;
  let durationUnit: string = durationOptions[1].value;
  let description: string;

  $: streamRate =
    parseInt(total) / (parseInt(duration) * parseInt(durationUnit));

  $: canSubmit = [title, total, duration, durationUnit, description].every(
    (v) => v
  );

  let creatingWorkstream = false;

  async function createWorkstream() {
    creatingWorkstream = true;

    const daiPerDay =
      parseInt(total) / (parseInt(duration) * parseInt(durationUnit));
    const weiPerDay = utils.parseUnits(daiPerDay.toString());
    const weiPerSecond = weiPerDay.div(86400);

    try {
      await fetch(`${getConfig().API_URL_BASE}/workstreams`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          ratePerSecond: {
            currency: 'dai',
            wei: weiPerSecond.toString()
          },
          title,
          desc: description,
          durationDays: parseInt(duration) * parseInt(durationUnit)
        } as WorkstreamInput)
      });
    } catch (e) {
      return;
    }
    goto('/dashboard');
    modal.hide();
  }
</script>

<Modal>
  <div slot="body">
    <Emoji emoji="👔" size="large" />
    <h1>Create a Workstream</h1>
    <form>
      <div class="input-with-label">
        <h4>Title</h4>
        <TextInput bind:value={title} placeholder="Max 256 characters" />
      </div>
      <div class="payment">
        <div class="inner">
          <div class="input-with-label payout">
            <h4>Total Payout</h4>
            <TextInput
              variant={{ type: 'number', min: 0 }}
              bind:value={total}
              placeholder="0"
              suffix="DAI"
            />
          </div>
          <div class="input-with-label duration">
            <h4>Duration</h4>
            <div class="input-group">
              <div class="number">
                <TextInput
                  variant={{ type: 'number', min: 0 }}
                  bind:value={duration}
                  placeholder="0"
                />
              </div>
              <div class="unit">
                <Dropdown bind:value={durationUnit} options={durationOptions} />
              </div>
            </div>
          </div>
          <div class="input-with-label rate">
            <h4 style="color: var(--color-foreground-level-4);">Stream rate</h4>
            {#if streamRate}
              <p>
                {Math.round((streamRate + Number.EPSILON) * 100) / 100} DAI / 24h
              </p>
            {:else}
              <p>0 DAI / 24h</p>
            {/if}
          </div>
        </div>
      </div>
      <div class="input-with-label">
        <h4>Description</h4>
        <TextArea
          bind:value={description}
          placeholder="Describe the tasks that have to be completed"
          caption="Markdown supported"
        />
      </div>
    </form>
    <div class="actions">
      <Button
        disabled={creatingWorkstream}
        variant="transparent"
        on:click={modal.hide}>Cancel</Button
      >
      <Button
        icon={TokenStreams}
        disabled={creatingWorkstream || !canSubmit}
        on:click={createWorkstream}
      >
        Create Workstream</Button
      >
    </div>
  </div>
</Modal>

<style>
  form > * {
    margin-bottom: 32px;
  }
  h1 {
    margin: 1rem 0 2rem;
    color: var(--color-foreground);
  }

  h4 {
    color: var(--color-foreground-level-6);
  }

  .input-with-label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .payment > .inner {
    display: flex;
    gap: 1.5rem;
  }

  .payment .payout {
    width: 8rem;
  }

  .duration > .input-group {
    display: flex;
    gap: 0.5rem;
  }

  .duration .number {
    width: 4rem;
  }

  .duration .unit {
    width: fit-content;
  }

  .rate > p {
    display: flex;
    height: 2.5rem;
    align-items: center;
    color: var(--color-foreground-level-4);
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
</style>
