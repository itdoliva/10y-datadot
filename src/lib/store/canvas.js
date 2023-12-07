import { derived, writable } from "svelte/store";

export const width = writable(100)
export const height = writable(100)
export const pixelRatio = writable(1);

export const figureWidth = writable(100);
export const figureHeight = writable(100);

export const nodes = writable([])
export const nNodes = derived(nodes, $nodes => $nodes.length);

export const gap = derived(pixelRatio, ($pixelRatio) => {
  return 18
});

export const nodeSize = derived(([ width, pixelRatio ]), ([ $width, $pixelRatio ]) => {
  // Mobile
  if ($width <= 768) {
    return 60
  }
  // Desktops
  if ($width <= 1800) {
    return 20
  }
  // Large Desktops
  return 25
})

export const colorHeight = derived((nodeSize), ($nodeSize) => {
  return $nodeSize * 1.25
})

