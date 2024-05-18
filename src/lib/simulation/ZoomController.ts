// Libraries
import * as d3 from "d3"
import { gsap } from "gsap";

// Stores
import { get } from "svelte/store"
import { width } from "../stores/canvas";
import { zoom, cameraOffsetX, cameraOffsetY } from "../stores/zoom";

export default class ZoomController {
  private userActions = true
  private zoomBase
  private zoom
  
  private transform
  
  private trnslt
  private trnsltExtent
  private trnsltExtentCenter
  
  private sclExtent = [ 1, 1 ]
  private scl
  
  private dragging
  private dragP0

  private tween;

  constructor(zoomBase) {
    this.zoomBase = zoomBase

    this.zoom = d3.zoom()
      .on("zoom", this.zoomed)
      .on("start", this.onZoomStart)
      .on("end", this.onZoomEnd)

    d3.select(this.zoomBase)
      .call(this.zoom)
      .on("wheel", this,this.handleWheel)
      .on("pointerup", this.handlePointerUp)

    this.tween = { x: 0, y: 0, k: 1 }
    this.transform = new d3.ZoomTransform(1, 0, 0)

    return this
  }


  // PRIVATE
  private onZoomStart = (e) => {
    this.dragging = false
    this.dragP0 = d3.pointer(e)

    if (this.userActions) {
    }
  }

  private onZoomEnd = () => {
    this.dragging = false
    this.dragP0 = undefined
  }

  private zoomed = (e) => {
    const { x, y, k } = e.transform

    const { dragP0 } = this
    const dragP1 = d3.pointer(e)

    this.dragging = this.dragging || 
      Math.sqrt( d3.sum(dragP1.map((_, i) => (dragP0[i] - dragP1[i])**2)) ) >= 3

    zoom.set(k)
    cameraOffsetX.set(x)
    cameraOffsetY.set(y)
  }

  private handleWheel = (e) => {
    e.preventDefault()
  }

  private handlePointerUp = (e) => {
    if (this.dragging) return

    const { clientX, clientY } = e

    d3.select("#canvas").node()
      .dispatchEvent(new PointerEvent('pointerup', { clientX, clientY }))
  }
  

  // PUBLIC
  public translateExtent = (extent: number[][]) => {
    const [ x0, x1 ] = extent.map(d => d[0])
    const [ y0, y1 ] = extent.map(d => d[1])

    this.trnsltExtentCenter = [
      x0 + (x1-x0)/2,
      y0 + (y1-y0)/2
    ]
    
    this.trnsltExtent = extent
    this.zoom.translateExtent(this.trnsltExtent)
    return this
  }

  public translate = (x, y) => {
    this.trnslt = [ x, y ]

    d3.select(this.zoomBase)
      .call(this.zoom.transform, this.transform.translate(-this.trnslt[0], -this.trnslt[1]))
    return this
  }

  public scaleExtent = (extent: number[]) => {
    // if (extent) this.sclExtent = extent

    // this.triggerZoom.scaleExtent(this.sclExtent)
    return this
  }

  public scale = (k: number) => {
    // const { triggerTarget, triggerZoom, transform } = this

    // this.scl = k

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
    // const { tween, trnslt, target, zoom, transform, trnsltExtentCenter } = this

    // const isMobile = get(width) < 768
    // const initK = isMobile ? .1 : .4
    // const finalK = isMobile ? 1 : 1


    // gsap.fromTo(tween, 
    //   {  x: 0, y: 0, k: initK },
    //   { 
    //     x: trnslt[0], 
    //     y: trnslt[1],
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