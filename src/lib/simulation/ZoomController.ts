// Libraries
import * as d3 from "d3"
import { gsap } from "gsap";

// Stores
import { get } from "svelte/store"
import { width } from "../stores/canvas";
import { zoom, cameraOffsetX, cameraOffsetY, isDragging } from "../stores/zoom";

export default class ZoomController {
  private target
  private targetSelection
  private zoomBehavior
  
  public translateExtentCenter;
  
  private _translateExtent;
  private _scaleExtent = [ 1, 1 ]
  private _scale = 1

  private t;

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
    this.t = d3.zoomTransform(target)

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

  public translateExtent = (extent: number[][] | undefined=undefined) => {
    if (!Array.isArray(extent)) {
      return this._translateExtent
    }

    this._translateExtent = extent
    
    const x = extent.map(d => d[0])
    const y = extent.map(d => d[1])
    
    this.translateExtentCenter = [
      x[0] + (x[1] - x[0])/2,
      x[0] + (x[1] - x[0])/2,
    ]
    
    this.zoomBehavior.translateExtent(extent)
    return this
  }

  public translateTo = (...args) => {
    this.zoomBehavior.translateTo(this.targetSelection, ...args)
    return this
  }

  public translateBy = (...args) => {
    this.zoomBehavior.translateBy(this.targetSelection, ...args)
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
    // Zoom effects are applied by the store $zoom
    // Still, we change the zoomBehavior transform scale aswell 
    // in order to keep consistency

    if (!k) {
      return this._scale
    }

    this._scale = k

    this.zoomBehavior.scaleTo(this.targetSelection, this._scale)
    zoom.set(this._scale)

    return this
    
  }

  public playEntrance(layout) {
    const { t } = this

    const isMobile = get(width) < 768
    const initK = isMobile ? .1 : .4
    const finalK = isMobile ? 1 : 1

    const onUpdate = () => {
      this.scale(t.k)
    }

    gsap.fromTo(t, 
      { k: initK },
      { k: finalK, duration: 2, ease: d3.easeCubicOut, onUpdate, overwrite: true })
  }

  public playExit() {
    const { t } = this

    const onUpdate = () => {
      this.scale(t.k)
    }

    gsap.to(t, 
      { k: 2, duration: 1, ease: d3.easeCubicIn, onUpdate, overwrite: true }) 
  }



}