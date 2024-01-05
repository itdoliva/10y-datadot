import { writable, derived } from "svelte/store";
import { width } from "$lib/store/canvas"

export const dataset = writable([])

export const sortBy = writable('year')
export const fyears = writable()
export const fdesigns = writable()
export const fgoals = writable()
export const findustries = writable()
export const fproducts = writable()


export function filterDataset(years, industries, designs, goals, products) {
  dataset.update(data => {
    return data.map(d => {
      let active = true

      const isDeactive = (
        (years && d.year < years[0] && d.year > years[1]) ||
        (designs && designs.length > 0 && !d.designs.some(design => designs.includes(design))) ||
        (goals && goals.length > 0 && !d.goals.some(goal => goals.includes(goal))) || 
        (products && products.length > 0 && !d.products.some(product => products.includes(product))) ||
        (industries && industries.length > 0 && !industries.some(d.industry))
      )

      if (isDeactive) {
        active = false
      }

      return { ...d, active }
    })
  })
}


export const nodes = derived([ dataset, sortBy ], ([ $dataset, $sortBy ]) => {
  return $dataset
    .sort((a, b) => (b.active - a.active) || (a[$sortBy] - b[$sortBy]))
    .map((item, i) => ({ ...item, i }))
})


export const nNodes = derived(nodes, $nodes => $nodes.filter(d => d.active).length);


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