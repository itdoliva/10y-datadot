// Libraries
import * as d3 from "d3"
import { gsap } from "gsap";

// Stores
import { get } from "svelte/store"
import { figureHeight, figureWidth, width } from "../stores/canvas";
import { zoom, cameraOffsetX, cameraOffsetY } from "../stores/zoom";
import Simulation from "../simulation/Simulation";
import { ILayoutSize, Layout } from "../types/simulation";
import { nodeSize, selected } from "../stores/nodes";

// Functions
import center from "../utility/center"
import SignalController from "./SignalController";

export default class ZoomController {
  private simulation: Simulation

  private initialized: boolean = false

  private userActions = true
  private zoomBase
  private zoom
  
  private curTranslateExtent: number[][]
  private curTranslateExtentCenter: number[]
  private curScaleExtent: number[]
  private curScaleIdeal: number
  
  private startEvent

  private dragging
  private dragT0: number | undefined

  private pinchSignal: SignalController
  private panSignal: SignalController


  constructor(simulation: Simulation) {
    this.simulation = simulation

    this.pinchSignal = new SignalController("pinch-signal")
    this.panSignal = new SignalController("pan-signal")

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

    this.startEvent = e
  }

  private onZoomEnd = (e) => {
    this.dragging = false
    this.dragT0 = undefined
  }

  private zoomed = (e) => {
    if (!!get(selected)) {
      return
    }

    const { x, y, k } = e.transform

    // If event was triggered by used
    // Check if there was a pan or zoom interaction
    // If so, stop the signal
    if (this.startEvent.sourceEvent) {
      const x0 = this.startEvent.transform.x
      const y0 = this.startEvent.transform.y
      const k0 = this.startEvent.transform.k

      if (x0 !== x || y0 !== y) {
        this.panSignal.stop()
      }

      if (k0 !== k) {
        this.pinchSignal.stop()
      }
    }


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

  public updateTranslateExtent = (layout: Layout, size?: ILayoutSize) => {
    if (!this.initialized) {
      return this
    }

    if (size) {
      this.curTranslateExtent =  this.getLayoutTranslateExtent(layout, size)
      this.curTranslateExtentCenter = [
        center(this.curTranslateExtent.map(d => d[0])),
        center(this.curTranslateExtent.map(d => d[1]))
      ]

      this.zoom.translateExtent(this.curTranslateExtent)

      if (this.curTranslateExtent[0][0] < 0 || this.curTranslateExtent[0][1] < 0) {
        this.panSignal.wait()
      }
    }


    return this
  }

// USE ZOOM IDENTITIES!

  public updateScaleExtent = (layout: Layout, windowWidth?: number) => {
    if (!this.initialized) {
      return this
    }

    if (windowWidth === undefined) {
      windowWidth = get(width)
    }

    let scaleExtent = [ 1, 1 ]
    let k = 1

    if (layout === "radial" && windowWidth < 768) {
      scaleExtent = [ .3, 1 ]
      k = .5

      if (this.curTranslateExtent[0][0] < 0 || this.curTranslateExtent[0][1] < 0) {
        this.pinchSignal.wait()
      }
    }

    this.curScaleIdeal = k
    this.curScaleExtent = scaleExtent
    this.zoom.scaleExtent(this.curScaleExtent)

    
    return this
  }

  public reposition(layout: Layout, moveOptions?) {
    const k = this.curScaleIdeal

    let x
    let y

    if (layout === "block") {
      x = 0
      y = -this.curTranslateExtent[0][1]
    }
    else {
      // There's a correct way to calculate the x/y when k != 1
      // and the solution below is a workaround only when k === .5 or k === 1
      x = k === 1 ? 0 : this.curTranslateExtentCenter[0]
      y = k === 1 ? 0 : this.curTranslateExtentCenter[1]
    }
    
    const transform = new d3.ZoomTransform(k, k*x, k*y)

    let node = d3.select(this.zoomBase)
    
    if (moveOptions) {
      node = node.transition()
        .duration(moveOptions.duration)
        .ease(d3.easeCubicInOut)
    }
      
    node
      .call(this.zoom.transform, transform)


    return this
  }




}