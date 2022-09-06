import { browser } from '$app/env';
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

const html = browser && document.querySelector('html');

let initialized = false;

function attach() {
  if (!initialized) {
    window.addEventListener('scroll', () => _update());
    initialized = true;
  }
}

function detach() {
  window.removeEventListener('scroll', () => _update());
  initialized = false;
}

function lock() {
  if (!html) throw new Error('Unable to select `html` element');
  html.style.overflow = 'hidden';
}

function unlock() {
  if (!html) throw new Error('Unable to select `html` element');
  html.style.overflow = 'scroll';
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
