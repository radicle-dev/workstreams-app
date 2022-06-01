<script lang="ts">
  import { utils } from 'ethers';

  import * as modal from '$lib/utils/modal';
  import type {
    ApplicationInput,
    Workstream
  } from '$lib/stores/workstreams/types';

  import Modal from '$components/Modal.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import Card from '$components/Card.svelte';
  import TitleMeta from '$components/TitleMeta.svelte';
  import TimeRate from '$components/TimeRate.svelte';
  import Apply from 'radicle-design-system/icons/Ledger.svelte';
  import TextArea from 'radicle-design-system/TextArea.svelte';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import Dropdown from 'radicle-design-system/Dropdown.svelte';
  import { weiToDai } from '$lib/utils/format';
  import { getConfig } from '$lib/config';

  export let workstream: Workstream;

  const durationOptions = [
    { value: '1', title: 'Days' },
    { value: '7', title: 'Weeks' },
    { value: '30', title: 'Months' },
    { value: '365', title: 'Years' }
  ];

  let applicationText: string;
  let duration = workstream.durationDays;
  let durationUnit: string = durationOptions[0].value;
  let total = weiToDai(workstream.total.wei);

  $: canSubmit = [applicationText, total, duration, durationUnit].every(
    (v) => v
  );

  let creatingApplication = false;

  async function createApplication() {
    creatingApplication = true;

    const daiPerDay = total / (duration * parseInt(durationUnit));
    const weiPerDay = utils.parseUnits(daiPerDay.toString()).toBigInt();
    const weiPerSecond = weiPerDay / BigInt(86400);

    try {
      await fetch(
        `${getConfig().API_URL_BASE}/workstreams/${workstream.id}/applications`,
        {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            letter: applicationText,
            ratePerSecond:
              weiPerSecond !== workstream.ratePerSecond.wei
                ? {
                    wei: weiPerSecond.toString(),
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
    <Emoji emoji="👔" size="large" />
    <h1>Workstream application</h1>
    <div class="input-with-label">
      <h4>Applying to</h4>
      <Card style="width: 100%; margin-bottom: 2rem;">
        <div slot="top">
          <TitleMeta {workstream} />
        </div>
        <div slot="bottom">
          <TimeRate {workstream} />
        </div>
      </Card>
    </div>
    <form>
      <div class="input-with-label">
        <h4>Application text</h4>
        <TextArea
          bind:value={applicationText}
          placeholder="Describe why you would like to apply"
          caption="Markdown supported"
        />
      </div>
      <div class="payment">
        <div class="inner">
          <div class="input-with-label payout">
            <h4>Total Payout</h4>
            <TextInput
              bind:value={total}
              variant={{ type: 'number', min: 0 }}
              placeholder="0"
              suffix="DAI"
            />
          </div>
          <div class="input-with-label duration">
            <h4>Duration</h4>
            <div class="input-group">
              <div class="number">
                <TextInput
                  bind:value={duration}
                  variant={{ type: 'number', min: 0 }}
                  placeholder="0"
                />
              </div>
              <div class="unit">
                <Dropdown bind:value={durationUnit} options={durationOptions} />
              </div>
            </div>
          </div>
        </div>
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
        Apply for workstream</Button
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
    width: 5rem;
  }

  .duration .unit {
    width: 7rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
</style>
