import * as d3 from "d3"
import { 
  cameraOffset, 
  zoom, 
  isDragging
} from "$lib/store/canvas";

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
  cameraOffset.set(transform.x, transform.y)
  zoom.setK(transform.k)
}