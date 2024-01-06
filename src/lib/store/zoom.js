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




export const zoomBehaviour = d3.zoom()
  .on("start", onZoomStart)
  .on("end", onZoomEnd)
  .on("zoom", zoomed)


function onZoomStart() {
  isDragging.set(true)
}

function onZoomEnd() {
  isDragging.set(false)
}

function zoomed({ transform }) {
  zoom.set(transform.k)
  cameraOffset.set(transform.x, transform.y)
}

export function updateExtents(layout, ww, wh, fw, fh) {
  const extentX = [0, fw]
  const extentY = [0, fh]
  const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])
  zoomBehaviour.extent(extent)

  if (ww < 768 && layout === 'radial') {
    zoomBehaviour.scaleExtent([.3, 1])
  }
  else {
    zoomBehaviour.scaleExtent([1, 1])
  }
}

export function resetZoomFactory(target, duration=1000) {
  return () => {
    d3.select(target)
      .transition()
      .duration(duration)
      .ease(d3.easeCubicInOut)
      .call(zoomBehaviour.transform, d3.zoomIdentity)
  }
}
