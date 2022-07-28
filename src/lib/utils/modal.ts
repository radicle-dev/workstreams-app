import { derived, get, writable } from 'svelte/store';
import type { SvelteComponent } from 'svelte';

type OnHide = () => void;

type ModalLayout = {
  modalComponent: typeof SvelteComponent;
  onHide: OnHide;
  modalComponentProps: { [key: string]: unknown };
};

const overlayStore = writable<ModalLayout | null>(null);
const hideable = writable<boolean>(true);
export const store = derived(
  [overlayStore, hideable],
  ([$overlayStore, $hideableStore]) => ({
    overlay: $overlayStore,
    hideable: $hideableStore
  })
);

const doNothing = (): void => null;

export const hide = (): void => {
  const canHide = get(hideable);

  if (!canHide) {
    return;
  }

  const stored = get(store);
  if (stored === null) {
    return;
  }

  stored.overlay.onHide();
  overlayStore.set(null);
};

export const setHideable = (value: boolean): void => {
  hideable.set(value);
};

export const show = (
  modalComponent: typeof SvelteComponent,
  onHide: OnHide = doNothing,
  modalComponentProps: { [key: string]: unknown } = {}
): void => {
  overlayStore.set({ modalComponent, onHide, modalComponentProps });
};

export const toggle = (
  modalComponent: typeof SvelteComponent,
  onHide: OnHide = doNothing,
  modalComponentProps: { [propName: string]: unknown } = {}
): void => {
  const stored = get(store);

  if (stored && stored.overlay.modalComponent === modalComponent) {
    hide();
    return;
  }

  show(modalComponent, onHide, modalComponentProps);
};
