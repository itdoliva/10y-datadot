import { writable, derived } from "svelte/store";
import { width } from "$lib/store/canvas"

export const nodes = writable([])
export const nNodes = derived(nodes, $nodes => $nodes.length);


export const nodeSize = derived(([ width ]), ([ $width ]) => {
  // Mobile
  if ($width <= 768) {
    return 25
  }
  // Desktops
  if ($width <= 1800) {
    return 20
  }
  // Large Desktops
  return 25
})

export const gap = derived(nodeSize, ($nodeSize) => {
  return .9*$nodeSize
});

export const colorHeight = derived((nodeSize), ($nodeSize) => {
  return $nodeSize * 1.25
})


export function sortIds(sortBy) {
  nodes.update(oldNodes => {
    return oldNodes
      .sort((a, b) => a[sortBy] - b[sortBy])
      .map((item, i) => ({ ...item, i }))
  })
}