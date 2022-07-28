import { get, writable } from 'svelte/store';
import { browser } from '$app/env';
import convertRemToPixels from '$lib/utils/remToPx';

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

if (browser && get(store).isMobile === undefined) {
  window.addEventListener('resize', updateIsMobile);
  updateIsMobile();
}

export default {
  subscribe: store.subscribe
};
