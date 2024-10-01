import { writable, derived } from "svelte/store";

import { selected } from "./nodes";

export const isFilterOpen = writable(false);

export const isToggleHidden = derived([ isFilterOpen, selected ], ([ $isFilterOpen, $selected ]) => {
  return $isFilterOpen || !!$selected;
})