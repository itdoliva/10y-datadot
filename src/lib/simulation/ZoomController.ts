// Libraries
import * as d3 from "d3"
import { gsap } from "gsap";

// Stores
import { get } from "svelte/store"
import { width } from "../stores/canvas";
import { zoom, cameraOffsetX, cameraOffsetY, isDragging } from "../stores/zoom";

export default class ZoomController {
  private userActions = true
  private targetSelected
  private zoomBehavior

  private transform
  
  private _translateExtent;
  private _translate
  private translateExtentCenter

  private _scaleExtent = [ 1, 1 ]
  private _scale

  private tween;

  constructor(target) {
    const zoomBehavior = d3.zoom()
      // .on("start", this.onZoomStart)
      // .on("end", this.onZoomEnd)
      // .on("zoom", this.zoomed)

    // d3.select(target)
    //   .call(zoomBehavior)
    //   .on("wheel", e => {
    //     e.preventDefault()
    //   })

    this.targetSelected = d3.select(target)
    this.zoomBehavior = zoomBehavior

    this.tween = { x: 0, y: 0, k: 1 }

    this.transform = new d3.ZoomTransform(1, 0, 0)

    return this
  }


  // PRIVATE
  private onZoomStart = () => {
    if (this.userActions) {
      isDragging.set(true)
    }
  }

  private onZoomEnd = () => {
    isDragging.set(false)
  }

  private zoomed(e) {
    const { x, y, k } = e.transform

    // console.log('*zoomed', x, y)

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
    const { targetSelected, zoomBehavior } = this

    targetSelected
      .transition()
      .duration(duration)
      .call(zoomBehavior.transform, d3.zoomIdentity)
    return this
  }

  public translateExtent = (extent: number[][] | undefined=undefined) => {
    if (!Array.isArray(extent)) {
      return this._translateExtent
    }

    const [ x0, x1 ] = extent.map(d => d[0])
    const [ y0, y1 ] = extent.map(d => d[1])

    this.translateExtentCenter = [
      x0 + (x1-x0)/2,
      y0 + (y1-y0)/2
    ]
    
    this._translateExtent = extent
    this.zoomBehavior.translateExtent(extent)
    return this
  }

  public translate = (x, y) => {
    const { targetSelected, zoomBehavior, transform } = this
    
    this._translate = [ x, y ]

    targetSelected.call(zoomBehavior.transform, transform.translate(-this._translate[0], -this._translate[1]))
    return this
  }

  public scaleExtent = (extent: number[]) => {
    if (extent) this._scaleExtent = extent

    this.zoomBehavior.scaleExtent(this._scaleExtent)
    return this
  }

  public scale = (k: number) => {
    const { targetSelected, zoomBehavior, transform } = this

    this._scale = k

    targetSelected.call(zoomBehavior.transform, transform.scale(k))
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
    const { tween, _translate, targetSelected, zoomBehavior, transform, translateExtentCenter } = this

    const isMobile = get(width) < 768
    const initK = isMobile ? .1 : .4
    const finalK = isMobile ? 1 : 1


    gsap.fromTo(tween, 
      {  x: 0, y: 0, k: initK },
      { 
        x: _translate[0], 
        y: _translate[1],
        k: finalK, 
        duration: 2, 
        ease: d3.easeCubicOut, 
        overwrite: true,

        onUpdate: () => {

          targetSelected.call(
            zoomBehavior.transform, 
            transform.translate(-tween.x, -tween.y)
          )

        },
        // onStart: () => this.setUserActions(false),
        // onComplete: () => this.setUserActions(true),
      })
  }

  public playExit() {
    const { tween } = this

    const onUpdate = () => {
      this.scale(t.k)
    }

    gsap.to(t, 
      { k: 2, 
        duration: 1, 
        ease: d3.easeCubicIn, 
        overwrite: true,
        onUpdate, 
        // onStart: () => this.setUserActions(false),
        // onComplete: () => this.setUserActions(true),
      }) 
  }




}