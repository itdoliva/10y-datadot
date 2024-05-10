import { writable } from "svelte/store";

// Offset
export const cameraOffsetX = writable(0)
export const cameraOffsetY = writable(0)

// Zoom
export const zoom = writable(1)

// Panning e Zooming support
export const isDragging = writable(false)

