import tick from '../tick';

afterEach(() => {
  tick.reset();
  jest.useRealTimers();
});

describe('tick', () => {
  it('starts after being started', () => {
    tick.start();

    expect(tick.isRunning()).toBe(true);
  });

  it('stops after being reset', () => {
    expect(tick.isRunning()).toBe(false);
  });

  it('returns a listener after adding it', () => {
    const listener = jest.fn();

    const registrationId = tick.register(listener);

    expect(Object.keys(tick.getListeners()).length).toBe(1);
    expect(tick.getListeners()[registrationId]).toBe(listener);
  });

  it('no longer returns a listener after removing it', () => {
    const listener = jest.fn();

    const registrationId = tick.register(listener);
    tick.deregister(registrationId);

    expect(Object.keys(tick.getListeners()).length).toBe(0);
    expect(tick.getListeners()[registrationId]).toBe(undefined);
  });

  it('calls registered listeners once a second while running', async () => {
    jest.useFakeTimers();

    const listener1 = jest.fn();

    const regId1 = tick.register(listener1);
    tick.start();

    jest.advanceTimersByTime(1500);

    expect(listener1).toBeCalledTimes(1);

    const listener2 = jest.fn();
    const regId2 = tick.register(listener2);

    jest.advanceTimersByTime(1000);

    expect(listener1).toBeCalledTimes(2);
    expect(listener2).toBeCalledTimes(1);

    tick.stop();

    jest.advanceTimersByTime(1000);

    expect(listener1).toBeCalledTimes(2);
    expect(listener2).toBeCalledTimes(1);

    tick.start();

    jest.advanceTimersByTime(1500);

    expect(listener1).toBeCalledTimes(3);
    expect(listener2).toBeCalledTimes(2);

    tick.deregister(regId1);

    jest.advanceTimersByTime(1000);

    expect(listener1).toBeCalledTimes(3);
    expect(listener2).toBeCalledTimes(3);

    tick.deregister(regId2);

    jest.advanceTimersByTime(1000);

    expect(listener1).toBeCalledTimes(3);
    expect(listener2).toBeCalledTimes(3);
  });
});

export {};
