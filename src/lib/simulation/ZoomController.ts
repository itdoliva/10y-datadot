import * as d3 from "d3"
import { zoom, cameraOffsetX, cameraOffsetY, isDragging } from "../stores/zoom";

export default class ZoomController {
  private target
  private zoomBehavior;

  constructor(target) {
    this.target = target
    this.zoomBehavior = d3.zoom()
      .on("start", this.onZoomStart)
      .on("end", this.onZoomEnd)
      .on("zoom", this.zoomed)

    d3.select(this.target)
      .call(this.zoomBehavior)
      .on("wheel", e => {
        e.preventDefault()
      })

    return this
  }


  onZoomStart() {
    isDragging.set(true)
  }


  onZoomEnd() {
    isDragging.set(false)
  }


  zoomed(e) {
    const { x, y, k } = e.transform

    zoom.set(k)
    cameraOffsetX.set(x)
    cameraOffsetY.set(y)
  }


  behavior() {
    return this.zoomBehavior
  }


  resetZoom(duration=1000) {

    d3.select(this.target)
      .transition()
      .duration(duration)
      .call(this.zoomBehavior.transform, d3.zoomIdentity)

  }

  translateExtent(extent, reset=true, resetDuration=0) {
    this.zoomBehavior.translateExtent(extent)

    if (reset) {
      this.resetZoom(resetDuration)
    }
  }

  scaleExtent(extent: number[]) {
    this.zoomBehavior.scaleExtent(extent)
  }

}