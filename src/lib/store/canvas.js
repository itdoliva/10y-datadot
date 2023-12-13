import { derived, writable } from "svelte/store";

export const width = writable(100)
export const height = writable(100)
export const pixelRatio = writable(1);

export const figureWidth = writable(100);
export const figureHeight = writable(100);

// Offset
export const cameraOffsetX = writable(0)
export const cameraOffsetY = writable(0)

export const cameraOffset = derived(([ cameraOffsetX , cameraOffsetY, pixelRatio ]), 
([ $cameraOffsetX, $cameraOffsetY, $pixelRatio ]) => {
  return { x: $cameraOffsetX*$pixelRatio, y: $cameraOffsetY*$pixelRatio }
})
cameraOffset.set = (x, y) => {
  cameraOffsetX.set(x)
  cameraOffsetY.set(y)
}

// Zoom

export const zoomK = writable(1)
export const zoom = derived(([ pixelRatio, zoomK ]), ([ $pixelRatio, $zoomK ]) => {
  return $zoomK * $pixelRatio
})
zoom.setK = (v) => zoomK.set(v)
zoom.updateK = (v) => zoomK.update(cur => cur + v)

// Panning e Zooming support
export const isDragging = writable(false)
