import { get, writable } from 'svelte/store';

interface ScrollStore {
  initialized: boolean;
  pos: number;
  scrolling: boolean;
  direction: 'up' | 'down' | undefined;
}

const store = writable<ScrollStore>({
  initialized: false,
  pos: 0,
  direction: undefined,
  scrolling: false
});

function attach() {
  window.addEventListener('scroll', () => _update());
}

function detach() {
  window.removeEventListener('scroll', () => _update());
}

function lock() {
  document.querySelector('html').style.overflow = 'hidden';
}

function unlock() {
  document.querySelector('html').style.overflow = 'scroll';
}

function _update() {
  const pos = Math.max(window.scrollY, 0);
  const direction = pos > get(store).pos ? 'down' : 'up';
  const scrolling = pos !== get(store).pos;

  store.set({
    initialized: true,
    pos,
    direction,
    scrolling
  });
}

export default {
  subscribe: store.subscribe,
  attach,
  detach,
  lock,
  unlock
};
