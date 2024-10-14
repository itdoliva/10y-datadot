import { writable, derived, readable } from "svelte/store";
import { _ } from 'svelte-i18n'

import { width } from "./canvas"

export const clients = writable([])
export const projects = writable([])
export const categories = writable([])
export const yearRange = writable([])

export const sortBy = writable('dt')

export const fyears = writable()
export const fdesigns = writable([])
export const fgoals = writable([])
export const findustries = writable([])
export const fproducts = writable([])

export const selected = writable()

export const categoriesEnriched = writable()


export const nodeSize = derived(([ width ]), ([ $width ]) => {
  // Mobile
  if ($width < 768) {
    return 30
  }
    return Math.round(0.01 * $width + 12.5)
})

export const lineWidth = derived(([ nodeSize ]), ([ $nodeSize ]) => {
  return Math.max(1, Math.round($nodeSize / 25))
})

export const gap = derived(nodeSize, ($nodeSize) => {
  return $nodeSize * .9
});