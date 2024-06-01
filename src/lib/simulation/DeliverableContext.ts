import * as PIXI from "pixi.js"
import { intersection } from "lodash"

import Deliverable from "./Deliverable"
import Simulation from "./Simulation"
import templates from "../templates"

import { selected } from "../stores/nodes"
import { hovered } from "../stores/canvas"


export default class DeliverableContext {
  private deliverable: Deliverable

  public context = new PIXI.Container()
  private graphics = new PIXI.Graphics()

  private baseGraphics: PIXI.Graphics

  public loading

  private ids = {
    background: [ 20, 21, 23, 24 ],
    base: [ 0, 1, 2 ],
    front: [ 16, 17, 10, 11, 12, 13, 14, 15, 22 ],
    mask: [ 16, 17 ],
    sprite: [ 30, 31, 32, 33, 34 ]
  } 

  constructor(deliverable: Deliverable, categories: number[]) {
    this.deliverable = deliverable 

    this.context.addChild(this.graphics)
    this.context.cursor = 'pointer'
    this.context.eventMode = 'none'
    this.context.onpointerenter = this.onpointerenter
    this.context.onpointerleave = this.onpointerleave
    this.context.onpointerup = this.select

    this.graphics.cacheAsBitmap = true

    const baseId = intersection(this.ids.base, categories)[0]
    const bkgrIds = intersection(this.ids.background, categories)
    const frntIds = intersection(this.ids.front, categories)
    const sprtIds = intersection(this.ids.sprite, categories)

    bkgrIds.forEach(this.addGraphics)
    this.baseGraphics = this.addGraphics(baseId)
    frntIds.forEach(this.addGraphics)
    
    this.loading = Promise.all(sprtIds.map(this.addGraphics))

    return this
  }

  public toScene = (scene: PIXI.Container, ticker: PIXI.Ticker) => {
    scene.addChild(this.context)
    ticker.add(this.tick)
  }

  private addGraphics = (id: number) => {
    let graphics

    if (this.ids.sprite.includes(id)) {
      graphics = templates[id](this.context)
    }
    else if (this.ids.mask.includes(id)) {
      graphics = templates[id]()
      graphics.mask = new PIXI.Graphics(this.baseGraphics.geometry)
      graphics.addChild(graphics.mask)

      this.graphics.addChild(graphics)
    }
    else {
      graphics = templates[id](this.graphics)
    }

    return graphics
  }

  private onpointerenter = () => {
    hovered.set(this.deliverable)
  } 

  private onpointerleave = () => {
    hovered.set(null)
  }

  private select = () => {
    selected.set(this.deliverable)
  }

  public toggleEventMode = () => {
    const onSelectedState = !!this.deliverable.simulation.onSelectedState
    const onTransition = this.deliverable.simulation.transition.running
    
    this.context.eventMode = (onSelectedState || onTransition) ? "none" : "dynamic"
  }

  private tick = () => {
    const { fx, fy, rotation, renderable, alpha, scale } = this.deliverable.attr.render

    this.context.renderable = renderable
    this.context.alpha = alpha

    this.context.x = fx || 0
    this.context.y = fy || 0
    this.context.rotation = rotation
    this.context.scale.set(scale) 
  }
}