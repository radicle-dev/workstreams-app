import { derived, get, writable } from 'svelte/store';
import type { SvelteComponent } from 'svelte';

type OnHide = () => void;

type ModalLayout = {
  modalComponent: typeof SvelteComponent;
  onHide: OnHide;
  modalComponentProps: unknown;
};

const overlayStore = writable<ModalLayout | null>(null);

export const store = derived(overlayStore, ($store) => $store);

const doNothing = (): void => null;

export const hide = (): void => {
  const stored = get(store);
  if (stored === null) {
    return;
  }

  stored.onHide();
  overlayStore.set(null);
};

export const show = (
  modalComponent: typeof SvelteComponent,
  onHide: OnHide = doNothing,
  modalComponentProps: unknown = {}
): void => {
  overlayStore.set({ modalComponent, onHide, modalComponentProps });
};

export const toggle = (
  modalComponent: typeof SvelteComponent,
  onHide: OnHide = doNothing,
  modalComponentProps: { [propName: string]: unknown } = {}
): void => {
  const stored = get(store);

  if (stored && stored.modalComponent === modalComponent) {
    hide();
    return;
  }

  show(modalComponent, onHide, modalComponentProps);
};
