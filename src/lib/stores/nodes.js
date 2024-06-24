import { writable, derived, readable } from "svelte/store";
import { _ } from 'svelte-i18n'

import { width } from "./canvas"

export const clients = writable([])
export const projects = writable([])
export const categories = writable([])

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