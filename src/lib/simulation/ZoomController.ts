// Libraries
import * as d3 from "d3"
import { gsap } from "gsap";

// Stores
import { get } from "svelte/store"
import { zoom, cameraOffsetX, cameraOffsetY, isDragging } from "../stores/zoom";

export default class ZoomController {
  private target
  private targetSelection
  private zoomBehavior
  
  private _translateExtentCenter;
  private _translateExtent;
  private _scaleExtent = [ 1, 1 ]
  private _scale = 1

  constructor(target) {
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
  public zoom = () => {
    return get(zoom)
  }

  public resetZoom = (duration=1000) => {
    const { target, zoomBehavior } = this

    d3.select(target)
      .transition()
      .duration(duration)
      .call(zoomBehavior.transform, d3.zoomIdentity)
    return this
  }

  public translateExtent = (extent: number[][] | undefined) => {
    if (!Array.isArray(extent)) {
      return this._translateExtent
    }

    this._translateExtent = extent
    this.zoomBehavior.translateExtent(extent)
    return this
  }

  public translateTo = (...args) => {
    this.zoomBehavior.translateTo(this.targetSelection, ...args)
    return this
  }

  public scaleExtent = (extent: number[]) => {
    if (extent) {
      this._scaleExtent = extent
    }

    this.zoomBehavior.scaleExtent(this._scaleExtent)
    return this
  }

  public scale = (k: number) => {

    if (!k) {
      return this._scale
    }

    this._scale = k

    this.zoomBehavior.scaleTo(this.targetSelection, this._scale)
    zoom.set(this._scale)

    return this
    
  }



}