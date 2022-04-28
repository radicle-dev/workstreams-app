<script lang="ts">
  // import { getConfig } from '$lib/config';
  import * as modal from '$lib/utils/modal';
  import type {
    ApplicationInput,
    Workstream
  } from '$lib/stores/workstreams/types';
  import { WorkstreamType } from '$lib/stores/workstreams/types';

  import Modal from '$components/Modal.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import Card from '$components/Card.svelte';
  import TitleMeta from '$components/TitleMeta.svelte';
  import Timeframe from '$components/Timeframe.svelte';
  import Rate from '$components/Rate.svelte';
  import Apply from 'radicle-design-system/icons/Ledger.svelte';
  import TextInput from '$components/TextInput.svelte';
  import Dropdown from 'radicle-design-system/Dropdown.svelte';
  import { getConfig } from '$lib/config';

  export let workstream: Workstream;

  const durationOptions = [
    { value: '1', title: 'Days' },
    { value: '7', title: 'Weeks' },
    { value: '30', title: 'Months' },
    { value: '365', title: 'Years' }
  ];

  let applicationText: string;
  let duration: string | undefined =
    workstream.type === WorkstreamType.GRANT
      ? `${workstream.duration}`
      : undefined;
  let durationUnit: string = durationOptions[0].value;
  let total: string =
    workstream.type === WorkstreamType.GRANT
      ? `${
          workstream.payment.rate *
          (parseInt(duration) * parseInt(durationUnit))
        }`
      : `${workstream.payment.rate * 365}`;

  $: streamRate =
    workstream.type === WorkstreamType.GRANT
      ? parseInt(total) / (parseInt(duration) * parseInt(durationUnit))
      : parseInt(total) / 365;

  $: canSubmit =
    workstream.type === WorkstreamType.GRANT
      ? [applicationText, total, duration, durationUnit].every((v) => v)
      : [applicationText, total].every((v) => v);

  let creatingApplication = false;

  async function createApplication() {
    creatingApplication = true;

    try {
      await fetch(
        `${getConfig().API_URL_BASE}/workstreams/${workstream.id}/applications`,
        {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            letter: applicationText,
            counterOffer:
              streamRate !== workstream.payment.rate
                ? {
                    rate: streamRate,
                    currency: 'dai'
                  }
                : undefined
          } as ApplicationInput)
        }
      );
    } catch (e) {
      return;
    }

    modal.hide();
  }
</script>

<Modal>
  <div slot="body">
    <span class="emoji">👔</span>
    <h1>{workstream.type} application</h1>
    <div class="input-with-label">
      <h4>Applying to</h4>
      <Card style="width: 100%; margin-bottom: 2rem;">
        <div slot="top">
          <TitleMeta
            title={workstream.title}
            type={workstream.type}
            creator={workstream.creator}
          />
        </div>
        <div slot="bottom" class="spread">
          {#if workstream.type === 'grant' && workstream.duration}
            <Timeframe duration={workstream.duration} />
          {/if}
          <Rate
            rate={workstream.payment.rate}
            currency={workstream.payment.currency}
          />
        </div>
      </Card>
    </div>
    <form>
      <div class="input-with-label">
        <h4>Application text</h4>
        <TextInput
          bind:value={applicationText}
          textarea
          placeholder="Markdown supported"
        />
      </div>
      <div class="payment">
        {#if workstream.type === 'grant'}
          <div class="inner">
            <div class="input-with-label payout">
              <h4>Total Payout</h4>
              <TextInput bind:value={total} placeholder="0" suffix="DAI" />
            </div>
            <div class="input-with-label duration">
              <h4>Duration</h4>
              <div class="input-group">
                <div class="number">
                  <TextInput bind:value={duration} placeholder="0" />
                </div>
                <div class="unit">
                  <Dropdown
                    bind:value={durationUnit}
                    options={durationOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        {:else if workstream.type === 'role'}
          <div class="inner">
            <div class="input-with-label payout">
              <h4>Yearly Salary</h4>
              <TextInput bind:value={total} placeholder="0" suffix="DAI" />
            </div>
          </div>
        {/if}
      </div>
    </form>
    <div class="actions">
      <Button
        disabled={creatingApplication}
        variant="outline"
        on:click={modal.hide}>Cancel</Button
      >
      <Button
        icon={Apply}
        disabled={creatingApplication || !canSubmit}
        on:click={createApplication}
      >
        Apply for {workstream.type}</Button
      >
    </div>
  </div>
</Modal>

<style>
  h1::first-letter {
    text-transform: capitalize;
  }
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
  .emoji {
    font-size: 2rem;
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
    width: 7rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .spread {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: flex-end;
  }
</style>
