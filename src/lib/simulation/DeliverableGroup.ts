import * as PIXI from "pixi.js"
import * as d3 from "d3"
import { gsap } from "gsap"
import { get } from "svelte/store";
import Deliverable from "./Deliverable";

import grahamScan from "../utility/grahamScan"
import Simulation from "./Simulation";
import { nodeSize } from "../stores/nodes";

import { LINK_STYLES } from "../utils/constants";


export default class DeliverableGroup {
  private simulation: Simulation
  public id: number
  private deliverables: Deliverable[]
  private color: number
  
  private context: PIXI.Graphics = new PIXI.Graphics()

  private active: boolean = false
  private hovered: boolean = false

  private render = {
    lineWidth: LINK_STYLES.lineWidth,
    radius: LINK_STYLES.radius,
    alpha: LINK_STYLES.alpha,
    renderable: false
  }


  constructor(simulation: Simulation, id: number, deliverables: Deliverable[], color: number) {
    this.simulation = simulation
    this.id = id
    this.deliverables = deliverables
    this.color = color

    this.context.blendMode = PIXI.BLEND_MODES.MULTIPLY
  }

  public toScene = (scene: PIXI.Container, ticker: PIXI.Ticker) => {
    scene.addChild(this.context)
    ticker.add(this.tick)
  }

  private tick = () => {
    this.context.clear()

    this.context.renderable = this.render.renderable

    const coordinates = this.deliverables
      .filter(d => d.active)
      .map((node: Deliverable) => grahamScan([ node.attr.render.fx, node.attr.render.fy ]))

    if (coordinates.length < 2) {
      return
    }

    
    // Line
    const lineStyle = {
      width: this.render.lineWidth,
      color: this.color,
      alpha: this.render.alpha,
      join: LINK_STYLES.join,
      cap: LINK_STYLES.cap,
    }

    this.context.lineStyle(lineStyle)
    
    const [ x0, y0 ] = coordinates[0]
    this.context.moveTo(x0, y0)
    coordinates.slice(1).forEach(([ x, y ]) => {
      this.context.lineTo(x, y)
    })

    // Circle
    this.context.lineStyle(0)
    this.context.beginFill(this.color, this.render.alpha)

    coordinates.forEach(([ x, y ]) => {
      this.context.drawCircle(x, y, this.render.radius)
    })

    this.context.endFill()
  }

  public setHovered = (isHovered: boolean) => {
    const prevHovered = this.hovered
    this.hovered = isHovered

    if (prevHovered !== this.hovered) {
      const lineWidth = isHovered ? LINK_STYLES.lineWidthHover : LINK_STYLES.lineWidth
      const alpha = isHovered ? LINK_STYLES.alphaHover : LINK_STYLES.alpha
      const radius = isHovered ? get(nodeSize) : LINK_STYLES.radius

      
      gsap.to(this.render, {
        lineWidth,
        alpha,
        radius,
  
        duration: .3,
        ease: d3.easeCubicInOut,
        overwrite: "auto"
      })
    }
  }

  public setActive = (isActive: boolean) => {
    const prev = this.active
    const cur = isActive
    
    this.active = cur

    if (prev === cur) {
      return
    }

    const tl = gsap.timeline({ overwrite: true })

    if (!prev && cur) {
      tl
      .set(this.render, { lineWidth: 0, alpha: 0, renderable: true })
      .to(this.render, { lineWidth: LINK_STYLES.lineWidth, duration: .5, ease: "elastic.out(2,1)", delay: Math.random() })
      .to(this.render, { alpha: LINK_STYLES.alphaHover*.5, duration: .5, ease: "power2.out"}, "<")
      .to(this.render, { alpha: LINK_STYLES.alpha, duration: .5, ease: "power2.in"})
    }
    else if (prev && !cur) {
      tl
      .set(this.render, { alpha: LINK_STYLES.alpha, renderable: false })
    }

  }
}