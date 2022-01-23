// Core
import { writable } from "svelte/store";

//parems

let params = {};

params.modalInitalState = {
  visible: false,
  modalId: null
}

// Modal Default Config
export const modalState = writable(params.modalInitalState);
export const closeModal = writable(() => {
  modalState.update(() => params.modalInitalState);
});
