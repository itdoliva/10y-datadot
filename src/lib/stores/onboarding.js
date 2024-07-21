import { writable } from "svelte/store";

export const ongoing = writable(false)
export const finished = writable(false)
export const contentKeyIdx = writable()