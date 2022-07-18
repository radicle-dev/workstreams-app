import { get, writable } from 'svelte/store';
import { browser } from '$app/env';

interface isMobileState {
  isMobile?: boolean;
  screenWidth?: number;
}

const store = writable<isMobileState>({});

function updateIsMobile() {
  const screenWidth = window.innerWidth;
  const isMobile = window.innerWidth < convertRemToPixels(54);

  store.set({
    isMobile,
    screenWidth
  });
}

function convertRemToPixels(rem: number) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

if (browser && get(store).isMobile === undefined) {
  window.addEventListener('resize', updateIsMobile);
  updateIsMobile();
}

export default store;
