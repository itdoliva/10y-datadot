// Libraries
import * as d3 from "d3"
import { gsap } from "gsap";

// Stores
import { get } from "svelte/store"
import { figureHeight, figureWidth, width } from "../stores/canvas";
import { zoom, cameraOffsetX, cameraOffsetY } from "../stores/zoom";
import Simulation from "./Simulation";
import { ILayoutSize, Layout } from "../types/simulation";
import { nodeSize, selected } from "../stores/nodes";

export default class ZoomController {
  private simulation: Simulation

  private initialized: boolean = false

  private userActions = true
  private zoomBase
  private zoom
  
  private transform: d3.ZoomTransform = new d3.ZoomTransform(1, 0, 0)
  
  private curTranslateExtent
  private curScaleExtent

  private trnslt
  private trnsltExtent
  private trnsltExtentCenter
  
  private sclExtent = [ 1, 1 ]
  private scl
  
  private dragging
  private dragT0: number | undefined

  private state = { 
    x: 0, 
    y: 0, 
    k: 1 
  }

  constructor(simulation: Simulation) {
    this.simulation = simulation

    this.zoom = d3.zoom()
      .on("zoom", this.zoomed)
      .on("start", this.onZoomStart)
      .on("end", this.onZoomEnd)

    this.initialized = true

    return this
  }

  public initZoom = (zoomBase) => {
    this.zoomBase = zoomBase

    d3.select(this.zoomBase)
      .call(this.zoom)
      .on("wheel", this.handleWheel)
      .on("pointerup", this.handlePointerUp)
  }


  // PRIVATE
  private onZoomStart = (e) => {
    this.dragging = false
    this.dragT0 = Date.now()

    if (this.userActions) {
    }
  }

  private onZoomEnd = () => {
    this.dragging = false
    this.dragT0 = undefined
  }

  private zoomed = (e) => {
    if (!!get(selected)) {
      return
    }
    const { x, y, k } = e.transform

    this.dragging = (Date.now() - <number>this.dragT0) >= 150

    zoom.set(k)
    cameraOffsetX.set(x)
    cameraOffsetY.set(y)
  }

  private handleWheel = (e) => {
    e.preventDefault()
  }

  private handlePointerUp = (e) => {
    if (this.dragging) return

    console.log('handlePointerUp')

    const { clientX, clientY } = e

    d3.select("#canvas").node()
      .dispatchEvent(new PointerEvent('pointerup', { clientX, clientY }))
  }

  
  public getLayoutTranslateExtent = (layout: Layout, size: ILayoutSize) => {
    const s_nodeSize = get(nodeSize)
    const s_fw = get(figureWidth)
    const s_fh = get(figureHeight)

    let extentX = [ 0, s_fw ]
    let extentY = [ 0, s_fh ]

    if (layout === "block") {
      const margin = s_nodeSize
      const exceedY = (size.height + s_nodeSize) - s_fh

      if (exceedY > 0) {
        extentY = [
          -(exceedY/2 + margin),
          +(exceedY/2 + margin) + s_fh
        ]
      }
    }

    else {
      const margin = s_nodeSize*3
      const exceedX = size.width - s_fw
      const exceedY = size.height - s_fh

      if (exceedX > 0) {
        extentX = [
          -(exceedX/2 + margin),
          +(exceedX/2 + margin) + s_fw
        ]
      }

      if (exceedY > 0) {
        extentY = [
          -(exceedY/2 + margin),
          +(exceedY/2 + margin) + s_fh
        ]
      }
    }

    const extent = d3.range(2).map((i: number) => {
      return [ extentX[i], extentY[i] ]
    })

    return extent
  }

  public updateTranslateExtent = (layout: Layout, size: ILayoutSize, moveTo:string|undefined=undefined) => {
    if (!this.initialized) return

    const translateExtent = this.getLayoutTranslateExtent(layout, size)

    this.curTranslateExtent = translateExtent

    this.zoom.translateExtent(translateExtent)

    if (moveTo) {
      d3.select(this.zoomBase)
        .transition()
        .duration(750)
        .call(this.zoom.translateTo, 0, moveTo === "top" ? translateExtent[0][1] : 0, [ 0, 0 ])
    }
  }

  public updateScaleExtent = (layout: Layout, windowWidth:number|undefined=undefined) => {
    if (!this.initialized) return

    if (windowWidth === undefined) {
      windowWidth = get(width)
    }

    let scaleExtent = [ 1, 1 ]
    let scaleTo = 1

    if (layout === "radial" && windowWidth < 768) {
      scaleExtent = [ .3, 1 ]
      scaleTo = .5
    }

    this.curScaleExtent = scaleExtent

    this.zoom.scaleExtent(scaleExtent)

    d3.select(this.zoomBase)
      .call(this.zoom.scaleTo, scaleTo)
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

  public entrance(isBlock: boolean) {
    // const { state, trnslt, target, zoom, transform, trnsltExtentCenter } = this

    // const isMobile = get(width) < 768
    // const initK = isMobile ? .1 : .4
    // const finalK = isMobile ? 1 : 1


    // gsap.fromTo(state, 
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
    //         transform.translate(-state.x, -state.y)
    //       )

    //     },
    //     // onStart: () => this.setUserActions(false),
    //     // onComplete: () => this.setUserActions(true),
    //   })
  }

  public playExit() {
    // const { state } = this

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