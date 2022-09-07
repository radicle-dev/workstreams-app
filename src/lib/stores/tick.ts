import { get, writable } from 'svelte/store';

const TICK_INTERVAL_MS = 1000;

export default (() => {
  const interval = writable<ReturnType<typeof setInterval> | undefined>();
  const listeners = writable<{ [registrationId: number]: () => void }>({});

  function reset() {
    stop();

    interval.set(undefined);
    listeners.set({});
  }

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
    const currListeners = Object.keys(get(listeners));

    let id = Object.keys(get(listeners)).length;

    while (currListeners[id]) id++;

    listeners.update((v) => ({ ...v, [id]: listener }));

    return id;
  }

  function deregister(registrationId: number): boolean {
    const currentRegistrations = get(listeners);
    if (!currentRegistrations[registrationId]) return false;

    delete currentRegistrations[registrationId];

    listeners.set(currentRegistrations);

    return true;
  }

  function getListeners() {
    return get(listeners);
  }

  function tick() {
    for (const registration of Object.values(get(listeners))) {
      registration();
    }
  }

  return {
    reset,
    start,
    stop,
    isRunning,
    register,
    deregister,
    getListeners
  };
})();
