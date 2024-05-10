import { writable, derived, readable } from "svelte/store";
import { _ } from 'svelte-i18n'

import * as d3 from "d3"

import { width } from "./canvas"

export const clients = writable([])
export const projects = writable([])
export const dataset = writable([])
export const categories = writable({})

export const sortBy = writable('year')
export const fyears = writable()
export const fdesigns = writable([])
export const fgoals = writable([])
export const findustries = writable([])
export const fproducts = writable([])

export const selected = writable({ active: false })
export const nodes = derived(
  [ dataset, fyears, findustries, fdesigns, fgoals, fproducts, categories, sortBy ], 
  ([ $dataset, $years, $industries, $designs, $goals, $products, $categories, $sortBy ]) => {

    const newNodes = $dataset.map(d => {
      const isDeactive = (
        ($years && (d.year < $years[0] || d.year > $years[1])) ||
        ($designs && $designs.length > 0 && !d.designs.some(design => $designs.includes(design))) ||
        ($goals && $goals.length > 0 && !d.goals.some(goal => $goals.includes(goal))) || 
        ($products && $products.length > 0 && !d.products.some(product => $products.includes(product))) ||
        ($industries && $industries.length > 0 && !$industries.includes(d.industry))
      )

      return { ...d, active: !isDeactive }
    })
    .sort((a, b) => 
      (+(b.active) - +(a.active)) || // Descending because we want active (1) before unactive (0)
      a[$sortBy] - b[$sortBy]
    )
    .map((item, i) => ({ ...item, i }))

    newNodes.activeIds = newNodes.filter(d => d.active).map(d => d.id).sort(d3.ascending)
    newNodes.activeCount = newNodes.activeIds.length
    newNodes.activePct = newNodes.activeCount / newNodes.length


    return newNodes
})


export const categoriesEnriched = derived([ nodes, categories ], ([ $nodes, $categories ]) => {
  if (Object.keys($categories).length === 0) return {}

  // console.log('categoriesEnriched')
  const enriched = {...$categories}

  const categoriesOfInterest = ['products', 'designs', 'industries']

  const activeNodes = $nodes.filter(d => d.active)

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

  // Object.keys(enriched).forEach(category => {
  //   Object.keys(enriched[category]).forEach(categoryValue => {
  //     const aliasKey = enriched[category][categoryValue].alias
  //     enriched[category][categoryValue].alias = $_(aliasKey)
  //   })
  // })



  return enriched
})



export const nodeSize = derived(([ width ]), ([ $width ]) => {
  // Mobile
  if ($width < 768) {
    return 30
  }
  else if ($width <= 1800) {
    return 20
  }
  return 15 + Math.ceil($width * .01)
})

export const lineWidth = derived(([ nodeSize ]), ([ $nodeSize ]) => {
  return $nodeSize / 20
})

export const gap = derived(nodeSize, ($nodeSize) => {
  return $nodeSize * .9
});