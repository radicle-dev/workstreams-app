import { get, writable } from 'svelte/store';

const TICK_INTERVAL_MS = 1000;

export interface TickRegistration {
  id: number;
  listener: () => void;
}

export default (() => {
  const interval = writable<ReturnType<typeof setInterval>>();
  const listeners = writable<TickRegistration[]>([]);

  function start() {
    if (get(interval)) throw 'Tick already running';

    interval.set(setInterval(tick, TICK_INTERVAL_MS));
  }

  function stop() {
    clearInterval(get(interval));
    interval.set(undefined);
  }

  function register(listener: () => void): number {
    const id = get(listeners).length;

    const registration = {
      listener,
      id
    };

    listeners.update((v) => [...v, registration]);

    return registration.id;
  }

  function deregister(registrationId: number): boolean {
    const currentRegistrations = get(listeners);
    const registration = currentRegistrations.find(
      (l) => l.id === registrationId
    );

    if (!registration) return false;

    listeners.set(currentRegistrations.filter((l) => l.id === registrationId));

    return true;
  }

  function tick() {
    for (const registration of get(listeners)) {
      registration.listener();
    }
  }

  return {
    start,
    stop,
    register,
    deregister
  };
})();
