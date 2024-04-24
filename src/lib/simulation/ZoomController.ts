import * as d3 from "d3"
import { get } from "svelte/store"
import { zoom, cameraOffsetX, cameraOffsetY, isDragging } from "../stores/zoom";

export default class ZoomController {
  private target
  private targetSelection
  private zoomBehavior

  constructor(target) {
    // console.log('zoomController init')
    // console.log('\t', target)
    // console.log('\t', d3.select(this.target))
    // console.log('\t', this.zoomBehavior)

    const zoomBehavior = d3.zoom()
      .on("start", this.onZoomStart)
      .on("end", this.onZoomEnd)
      .on("zoom", this.zoomed)

    d3.select(target)
      .call(zoomBehavior)
      .on("wheel", e => {
        e.preventDefault()
      })

    this.target = target
    this.targetSelection = d3.select(target)
    this.zoomBehavior = zoomBehavior

    return this
  }


  // PRIVATE
  private onZoomStart() {
    isDragging.set(true)
  }

  private onZoomEnd() {
    isDragging.set(false)
  }

  private zoomed(e) {
    const { x, y, k } = e.transform

    // console.log(get(zoom))
    zoom.set(k)
    cameraOffsetX.set(x)
    cameraOffsetY.set(y)
  }

  public behavior() {
    return this.zoomBehavior
  }

  // PUBLIC
  public resetZoom = (duration=1000) => {
    // console.log('resetZoom')

    const { target, zoomBehavior } = this

    d3.select(target)
      .transition()
      .duration(duration)
      .call(zoomBehavior.transform, d3.zoomIdentity)
  }

  public translateExtent = (extent, reset=true, resetDuration=0) => {
    // console.log('translateExtent')
    const { zoomBehavior, resetZoom } = this

    zoomBehavior.translateExtent(extent)
    if (reset) resetZoom(resetDuration)
  }

  public scaleExtent = (extent: number[]) => {
    // console.log('scaleExtent')

    const { zoomBehavior } = this
    zoomBehavior.scaleExtent(extent)
  }

  public scaleTo = (scale) => {
    const { zoomBehavior } = this
    zoomBehavior.scaleTo(this.targetSelection, scale)
    zoom.set(scale)
  }

}