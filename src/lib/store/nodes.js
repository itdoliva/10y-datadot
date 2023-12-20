import { writable, derived } from "svelte/store";
import { width } from "$lib/store/canvas"

export const dataset = writable([])

export const sortBy = writable('year')
export const fyears = writable()

export const filtered = derived([dataset, fyears], ([$dataset, $years]) => {
  let f = [...$dataset]

  if ($years) {
    const [ minYear, maxYear ] = $years
    f = f.filter(d => d.year >= minYear && d.year <= maxYear)
  }

  return f
})

export const nodes = derived([ filtered, sortBy ], ([ $filtered, $sortBy ]) => {
  return $filtered
    .sort((a, b) => a[$sortBy] - b[$sortBy])
    .map((item, i) => ({ ...item, i }))
})




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