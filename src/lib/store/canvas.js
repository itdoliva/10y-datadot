import { derived, writable } from "svelte/store";

export const width = writable(100)
export const height = writable(100)
export const pixelRatio = writable(1);

export const figureWidth = writable(100);
export const figureHeight = writable(100);

// Offset
export const cameraOffsetX = writable(0)
export const cameraOffsetY = writable(0)

export const cameraOffset = derived(([ cameraOffsetX , cameraOffsetY ]), 
([ $cameraOffsetX, $cameraOffsetY ]) => {
  return { x: $cameraOffsetX, y: $cameraOffsetY }
})
cameraOffset.set = (x, y) => {
  cameraOffsetX.set(x)
  cameraOffsetY.set(y)
}

// Zoom
export const zoomSensitivity = writable(.0005)

export const zoomK = writable(1)
export const zoomMax = writable(2)
export const zoomMin = writable(.5)

export const zoom = derived(([ pixelRatio, zoomK, zoomMax, zoomMin ]), ([ $pixelRatio, $zoomK, $zoomMax, $zoomMin ]) => {
  return Math.max(Math.min($zoomK, $zoomMax), $zoomMin) * $pixelRatio
})
zoom.setK = (v) => zoomK.set(v)
zoom.updateK = (v) => zoomK.update(cur => cur + v)
zoom.setMax = (v) => zoomMax.set(v)
zoom.setMin = (v) => zoomMin.set(v)

// Panning e Zooming support
export const isDragging = writable(false)

export const dragStartX = writable(0)
export const dragStartY = writable(0)

export const dragStart = derived(([ dragStartX, dragStartY ]), ([ $dragStartX, $dragStartY ]) => {
  return { x: $dragStartX, y: $dragStartY}
})
dragStart.set = (x, y) => {
  dragStartX.set(x)
  dragStartY.set(y)
}

export const initialPinchDistance = writable(null)
export const lastZoom = writable(1)