import { get, writable } from 'svelte/store';

const TICK_INTERVAL_MS = 1000;

export interface TickRegistration {
  id: number;
  listener: () => void;
}

export default (() => {
  const interval = writable<ReturnType<typeof setInterval>>();
  const listeners = writable<(() => void)[]>([]);

  function start() {
    if (get(interval)) throw 'Tick already running';

    interval.set(setInterval(tick, TICK_INTERVAL_MS));
  }

  function stop() {
    clearInterval(get(interval));
    interval.set(undefined);
  }

  function isRunning() {
    return Boolean(get(interval));
  }

  function register(listener: () => void): number {
    const currentIndex = get(listeners).indexOf(listener);

    if (currentIndex !== -1) return currentIndex;

    listeners.update((v) => [...v, listener]);

    return get(listeners).indexOf(listener);
  }

  function deregister(registrationId: number): boolean {
    const currentRegistrations = get(listeners);
    if (!currentRegistrations[registrationId]) return false;

    currentRegistrations.splice(registrationId);

    listeners.set(currentRegistrations);

    return true;
  }

  function tick() {
    for (const registration of get(listeners)) {
      registration();
    }
  }

  return {
    start,
    stop,
    isRunning,
    register,
    deregister
  };
})();
