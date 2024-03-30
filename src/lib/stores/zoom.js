import { writable, derived } from "svelte/store";
import * as d3 from "d3"


// Offset
export const cameraOffsetX = writable(0)
export const cameraOffsetY = writable(0)

export const cameraOffset = derived(([ cameraOffsetX , cameraOffsetY ]), ([ $cameraOffsetX, $cameraOffsetY ]) => {
  return { 
    x: $cameraOffsetX,
    y: $cameraOffsetY
  }
})

cameraOffset.set = (x, y) => {
  cameraOffsetX.set(x)
  cameraOffsetY.set(y)
}

// Zoom
export const zoom = writable(1)

// Panning e Zooming support
export const isDragging = writable(false)

