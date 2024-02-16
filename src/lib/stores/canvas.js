import { writable } from "svelte/store";

export const app = writable()

export const width = writable(100)
export const height = writable(100)
export const pixelRatio = writable(1);

export const figureWidth = writable(0);
export const figureHeight = writable(0);

export const hovered = writable()

export const complexityOn = writable(false)
export const linkProjectOn = writable(false)
export const linkClientOn = writable(false)