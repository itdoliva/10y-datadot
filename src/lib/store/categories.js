import { derived, writable } from "svelte/store";
import { filtered } from "$lib/store/nodes";

export const categories = writable({})

export const categoriesEnriched = derived([ filtered, categories ], ([ $filtered, $categories ]) => {
  if (Object.keys($categories).length === 0) return {}

  const enriched = {...$categories}

  const categoriesOfInterest = ['products', 'designs', 'industries']

  const activeNodes = $filtered.filter(d => d.active)

  categoriesOfInterest.forEach(category => {
    enriched[category].forEach(d => {
      const { id } = d

      const f = category !== 'industries'
        ? node => node[category].includes(id)
        : node => node.industry === id

      d.nNodes = activeNodes.filter(f).length
      d.pctNodes = +(d.nNodes / activeNodes.length).toFixed(2)
    })
  })

  return enriched
})