// Libraries
import * as d3 from "d3"
import { gsap } from "gsap";

// Stores
import { get } from "svelte/store"
import { width } from "../stores/canvas";
import { zoom, cameraOffsetX, cameraOffsetY, isDragging } from "../stores/zoom";

export default class ZoomController {
  private userActions = true
  private triggerTarget
  private target
  private zoom
  private triggerZoom

  private transform
  
  private _translateExtent;
  private _translate
  private translateExtentCenter

  private _scaleExtent = [ 1, 1 ]
  private _scale

  private dragP0

  private tween;

  constructor(triggerTarget, target) {
    this.triggerTarget = triggerTarget
    this.target = target

    this.zoom = d3.zoom()
      .on("zoom", this.targetZoomed)

    this.triggerZoom = d3.zoom()
      .on("start", this.onZoomStart)
      .on("end", this.onZoomEnd)
      .on("zoom", this.triggerZoomed)

    d3.select(this.target)
      .call(this.zoom)

    d3.select(this.triggerTarget)
      .call(this.triggerZoom)
      .on("wheel", e => {
        e.preventDefault()
      })


    this.tween = { x: 0, y: 0, k: 1 }
    this.transform = new d3.ZoomTransform(1, 0, 0)

    return this
  }


  // PRIVATE
  private onZoomStart = (e) => {
    this.dragP0 = d3.pointer(e)

    if (this.userActions) {
    }
  }

  private onZoomEnd = () => {
    this.dragP0 = undefined
    isDragging.set(false)
  }

  private triggerZoomed = (e) => {
    const { dragP0 } = this
    const dragP1 = d3.pointer(e)

    isDragging.set(
      Math.sqrt(d3.sum(
        dragP0.map((_, i) => Math.pow(dragP0[i] - dragP1[i], 2))
      )) > 3
    )

    console.log(this.dragP0, dragP1, get(isDragging))


    this.zoom.transform(
      d3.select(this.target),
      e.transform,
      [0, 0]
    )

    // this.zoom.scaleTo(
    //   d3.select(this.target),
    //   e.transform.k,
    //   [ px + 840, 0]
    // )

    // this.zoom.translateTo(
    //   d3.select(this.target),
    //   -e.transform.x, 
    //   -e.transform.y, 
    //   [0, 0]
    // )
  }

  private targetZoomed = (e) => {
    const { x, y, k } = e.transform

    zoom.set(k)
    cameraOffsetX.set(x)
    cameraOffsetY.set(y)
  }


  // PUBLIC
  public resetZoom = (duration=1000) => {
    // const { triggerTarget, triggerZoom } = this

    // d3.select(triggerTarget)
    //   .transition()
    //   .duration(duration)
    //   .call(triggerZoom.transform, d3.zoomIdentity)
    // return this
  }

  public translateExtent = (extent: number[][] | undefined=undefined) => {
    // if (!Array.isArray(extent)) {
    //   return this._translateExtent
    // }

    // const [ x0, x1 ] = extent.map(d => d[0])
    // const [ y0, y1 ] = extent.map(d => d[1])

    // this.translateExtentCenter = [
    //   x0 + (x1-x0)/2,
    //   y0 + (y1-y0)/2
    // ]
    
    // this._translateExtent = extent
    // // this.triggerZoom.translateExtent(extent)
    return this
  }

  public translate = (x, y) => {
    // const { triggerTarget, triggerZoom, transform } = this
    
    // this._translate = [ x, y ]

    // d3.select(triggerTarget)
    //   .call(triggerZoom.transform, transform.translate(-this._translate[0], -this._translate[1]))
    return this
  }

  public scaleExtent = (extent: number[]) => {
    // if (extent) this._scaleExtent = extent

    // this.triggerZoom.scaleExtent(this._scaleExtent)
    return this
  }

  public scale = (k: number) => {
    // const { triggerTarget, triggerZoom, transform } = this

    // this._scale = k

    // d3.select(triggerTarget)
    //   .call(triggerZoom.transform, transform.scale(k))
    return this
  }

  public setUserActions(allow: boolean) {
    this.userActions = allow

    if (allow) {
    }
    else {
      
    }
  }

  public playEntrance(layout) {
    // const { tween, _translate, target, zoom, transform, translateExtentCenter } = this

    // const isMobile = get(width) < 768
    // const initK = isMobile ? .1 : .4
    // const finalK = isMobile ? 1 : 1


    // gsap.fromTo(tween, 
    //   {  x: 0, y: 0, k: initK },
    //   { 
    //     x: _translate[0], 
    //     y: _translate[1],
    //     k: finalK, 
    //     duration: 2, 
    //     ease: d3.easeCubicOut, 
    //     overwrite: true,

    //     onUpdate: () => {

    //       d3.select(target).call(
    //         zoom.transform, 
    //         transform.translate(-tween.x, -tween.y)
    //       )

    //     },
    //     // onStart: () => this.setUserActions(false),
    //     // onComplete: () => this.setUserActions(true),
    //   })
  }

  public playExit() {
    // const { tween } = this

    // const onUpdate = () => {
    //   this.scale(t.k)
    // }

    // gsap.to(t, 
    //   { k: 2, 
    //     duration: 1, 
    //     ease: d3.easeCubicIn, 
    //     overwrite: true,
    //     onUpdate, 
    //     // onStart: () => this.setUserActions(false),
    //     // onComplete: () => this.setUserActions(true),
    //   }) 
  }




}