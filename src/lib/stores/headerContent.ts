import type { SvelteComponent } from 'svelte';
import type { SvelteComponentDev } from 'svelte/internal';
import { writable } from 'svelte/store';

interface HeaderContentStore {
  component?: typeof SvelteComponent | typeof SvelteComponentDev;
  props?: { [key: string]: unknown };
  /*
    If undefined, shows as soon as user scrolled down.
    If boolean value, shows when value is true.
  */
  headerContentShown?: boolean;
}

export const headerContent = writable<HeaderContentStore>({});
