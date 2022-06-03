<div class="loading-dots">
  <div />
  <div />
  <div />
</div>

<style>
  .loading-dots {
    display: flex;
    gap: 0.25rem;
  }

  .loading-dots > * {
    background-color: var(--color-foreground-level-4);
    height: 0.4rem;
    width: 0.4rem;
    border-radius: 0.25rem;
    animation: dots 0.75s infinite;
  }

  .loading-dots > :nth-child(2) {
    animation-delay: 0.075s;
  }

  .loading-dots > :nth-child(3) {
    animation-delay: 0.15s;
  }

  @keyframes dots {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.3);
    }
    50% {
      transform: scale(1);
    }
  }
</style>
