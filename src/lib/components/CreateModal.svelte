<script lang="ts">
  import Emoji from 'radicle-design-system/Emoji.svelte';
  import Button from 'radicle-design-system/Button.svelte';
  import Dropdown from 'radicle-design-system/Dropdown.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import TextArea from 'radicle-design-system/TextArea.svelte';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';

  import * as modal from '$lib/utils/modal';
  import Modal from '$components/Modal.svelte';
  import { utils } from 'ethers';
  import workstreamsStore from '$lib/stores/workstreams';
  import ensNames from '$lib/stores/ensNames';
  import { walletStore } from '$lib/stores/wallet/wallet';
  import drips from '$lib/stores/drips';
  import { cidToBase10 } from '$lib/utils/cid';
  import { toWei } from 'drips-sdk';

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
  let assignee: string;
  let assigneeAddress: string | undefined;

  $: streamRate =
    parseInt(total) / (parseInt(duration) * parseInt(durationUnit));

  $: canSubmit = [
    title,
    total,
    duration,
    durationUnit,
    description,
    assigneeAddress
  ].every((v) => v);

  let assigneeValidationState: TextInputValidationState;

  async function validateAssignee() {
    if (!assignee || assignee === '') {
      assigneeValidationState = { type: 'unvalidated' };
      assigneeAddress = undefined;
      return;
    } else if (assignee.endsWith('.eth')) {
      assigneeValidationState = { type: 'pending' };

      const address = await ensNames.reverse(assignee, $walletStore.provider);

      if (!address) {
        assigneeValidationState = {
          type: 'invalid',
          message: 'Unable to resolve ENS name.'
        };
        return;
      }

      if (address.toLowerCase() === $walletStore.address) {
        assigneeValidationState = {
          type: 'invalid',
          message: 'You cannot assign yourself.'
        };
        return;
      }

      assigneeAddress = address.toLowerCase();
    } else {
      const validAddress = utils.isAddress(assignee);

      if (!validAddress) {
        assigneeValidationState = {
          type: 'invalid',
          message: 'Invalid address or ENS name.'
        };
        return;
      }

      if (assignee.toLowerCase() === $walletStore.address) {
        assigneeValidationState = {
          type: 'invalid',
          message: 'You cannot assign yourself.'
        };
        return;
      }

      assigneeAddress = assignee.toLowerCase();
    }
    assigneeValidationState = { type: 'valid' };
  }

  let creatingWorkstream = false;

  async function createWorkstream() {
    creatingWorkstream = true;

    const { address } = $walletStore;
    if (!address) throw new Error('Connect wallet first');

    const daiPerDay =
      parseInt(total) / (parseInt(duration) * parseInt(durationUnit));
    const weiPerDay = utils.parseUnits(daiPerDay.toString());
    const weiPerSecond = weiPerDay.div(86400);

    const chainId = $walletStore.network?.chainId;

    if (!chainId) throw new Error('Unable to determine chain ID');
    if (!assigneeAddress) throw new Error('Assignee address is missing');

    try {
      const cid = await workstreamsStore.createWorkstream({
        creator: address,
        amountPerSecond: {
          currency: 'dai',
          wei: weiPerSecond.toBigInt()
        },
        streamTarget: {
          currency: 'dai',
          wei: weiPerDay.toBigInt() * BigInt(parseInt(duration))
        },
        title,
        description,
        createdAt: new Date(),
        receiver: assigneeAddress
      });

      const call = await drips.createDrip(
        assigneeAddress,
        {
          currency: 'dai',
          wei: weiPerSecond.toBigInt()
        },
        BigInt(cidToBase10(cid)),
        toWei('10').toBigInt()
      );

      await call.tx.wait(1);

      // Push the new workstream into the state so it shows up on the dashboard.
      await workstreamsStore.fetchWorkstream(cid.toString());
    } catch (e) {
      return;
    }

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
      <div class="input-with-label">
        <h4>Assignee</h4>
        <TextInput
          showSuccessCheck
          validationState={assigneeValidationState}
          bind:value={assignee}
          on:input={validateAssignee}
          placeholder="Ethereum address or ENS name"
        />
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
          textareaStyle="height: 80px;"
          resizable
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
    flex-wrap: wrap;
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
