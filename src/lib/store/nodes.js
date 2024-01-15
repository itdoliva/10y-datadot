import { writable, derived } from "svelte/store";
import { width } from "$lib/store/canvas"

export const dataset = writable([])

export const sortBy = writable('year')
export const fyears = writable()
export const fdesigns = writable()
export const fgoals = writable()
export const findustries = writable()
export const fproducts = writable()


export const filtered = derived(
  [dataset, fyears, findustries, fdesigns, fgoals, fproducts],
  ([$dataset, $years, $industries, $designs, $goals, $products]) => {
    return $dataset.map(d => {
      let active = true

      const isDeactive = (
        ($years && d.year < $years[0] && d.year > $years[1]) ||
        ($designs && $designs.length > 0 && !d.designs.some(design => $designs.includes(design))) ||
        ($goals && $goals.length > 0 && !d.goals.some(goal => $goals.includes(goal))) || 
        ($products && $products.length > 0 && !d.products.some(product => $products.includes(product))) ||
        ($industries && $industries.length > 0 && !$industries.some(d.industry))
      )

      if (isDeactive) {
        active = false
      }

      return { ...d, active }
    })
  })


let counter = 0 
export const nodes = derived([ filtered, sortBy ], ([ $filtered, $sortBy ]) => {
  counter++

  const arr = [...$filtered]
    .sort((a, b) => 
      (+(b.active) - +(a.active)) || // Descending because we want active (1) before unactive (0)
      (a.id - b.id)
      // (a[$sortBy] - b[$sortBy])
    )
    .map((item, i) => ({ ...item, i, counter }))

  arr.counter = counter

  return arr

})


export const nNodes = derived(filtered, $filtered => $filtered.filter(d => d.active).length);


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