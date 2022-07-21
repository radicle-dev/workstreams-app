import { CupertinoPane } from 'cupertino-pane';

import type { SvelteComponent } from 'svelte';
import { get, writable } from 'svelte/store';

import scroll from '$lib/stores/scroll';

interface CupertinoSheetStore {
  component?: typeof SvelteComponent;
  props?: { [key: string]: unknown };
}

export default (() => {
  const store = writable<CupertinoSheetStore>({});
  const pane = writable<CupertinoPane>();

  function attach() {
    pane.set(
      new CupertinoPane('.cupertino-pane', {
        backdrop: true,
        fastSwipeClose: true,
        buttonDestroy: false,
        bottomClose: true,
        showDraggable: false,
        fitHeight: true
      })
    );

    _setListeners();
  }

  function detach() {
    get(pane).destroy();
  }

  function openSheet(
    component: typeof SvelteComponent,
    props: { [key: string]: unknown } = {}
  ): void {
    const p = get(pane);

    if (!p) {
      throw 'Pane not initialized';
    }

    store.set({ component, props });
    p.present({ animate: true });
  }

  function closeSheet() {
    const p = get(pane);

    p.hide();
  }

  function _setListeners() {
    const p = get(pane);

    p.on('onWillPresent', () => {
      scroll.lock();
    });

    p.on('onDidDismiss', () => {
      scroll.unlock();
      store.set({});
    });

    p.on('onBackdropTap', () => {
      p.hide();
    });
  }

  return {
    subscribe: store.subscribe,
    attach,
    detach,
    openSheet,
    closeSheet
  };
})();
