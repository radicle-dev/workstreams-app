import { get, writable } from 'svelte/store';

interface ScrollPosStore {
  initialized: boolean;
  scrollPos: number;
  scrolling: boolean;
  direction: 'up' | 'down' | undefined;
}

const store = writable<ScrollPosStore>({
  initialized: false,
  scrollPos: 0,
  direction: undefined,
  scrolling: false
});

function attach(element: HTMLDivElement) {
  element.addEventListener('scroll', () => _update(element));
}

function detach(element: HTMLDivElement) {
  element.removeEventListener('scroll', () => _update(element));
}

function _update(element: HTMLDivElement) {
  const scrollPos = Math.max(element.scrollTop, 0);
  const direction = scrollPos > get(store).scrollPos ? 'down' : 'up';
  const scrolling = scrollPos !== get(store).scrollPos;

  store.set({
    initialized: true,
    scrollPos,
    direction,
    scrolling
  });
}

export default {
  attach,
  detach,
  subscribe: store.subscribe
};
