<script lang="ts">
	export let selected: 'first' | 'second' = 'first';
</script>

<div class="type-switcher">
	<div class="options">
		<div
			class="option first"
			class:selected={selected === 'first'}
			on:click={() => (selected = 'first')}
		>
			<div class="option-content"><slot name="first" /></div>
		</div>
		<div
			class="option second"
			class:selected={selected === 'second'}
			on:click={() => (selected = 'second')}
		>
    <div class="option-content"><slot name="second" /></div>
		</div>
	</div>
	<div class="indicator-wrapper">
		<div class="indicator" class:second={selected === 'second'} />
	</div>
</div>

<style>
	.type-switcher {
		position: relative;
	}

	.options {
		display: flex;
		width: 100%;
		height: 100%;
		gap: 8px;
	}

	.option {
		padding: 16px;
		border-radius: 8px;
		flex: 1;
		box-sizing: border-box;
		border: 1px solid rgba(0, 0, 0, 0);
		transition: border 0.2s;
    cursor: pointer;
    transition: background-color .2s;
	}

  .option:hover {
    background-color: var(--color-foreground-level-1);
  }

  .option-content {
    z-index: 1;
    opacity: .5;
    position: relative;
    transition: opacity .3s;
  }

  .selected > .option-content {
    opacity: 1;
  }

	.option:not(.selected) {
		border: 1px solid var(--color-foreground-level-3);
	}

	.indicator-wrapper {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.indicator {
		background: var(--color-primary);
		width: calc(50% - 4px);
		height: 100%;
		position: absolute;
		border-radius: 8px;
		transition: transform 0.3s;
	}

	.indicator.second {
		transform: translateX(calc(100% + 8px));
	}
</style>
