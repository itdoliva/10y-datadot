import * as PIXI from "pixi.js"
import intersection from "lodash/intersection"

import Deliverable from "./Deliverable"
import Simulation from "./Simulation"
import templates from "../templates"

import { selected } from "../stores/nodes"
import { hovered } from "../stores/canvas"
import getRandomSoundSprite from "../utility/getRandomSoundSprite"


export default class DeliverableContext {
  private deliverable: Deliverable

  public context = new PIXI.Container()
  private graphics = new PIXI.Graphics()

  private baseGraphics: PIXI.Graphics

  public loading

  private ids = {
    background: [ 
      "design.ilustracao",
      "design.infografia",
      "design.motion-graphics",
      "design.editorial",
      "design.user-interface",
      "design.datavis",
      "design.design-de-servicos",
    ],
    base: [ 
      "channel.digital",
      "channel.impressa",
      "channel.consultoria"
    ],
    front: [ 
      "product.video",

      "product.publicacao",
      "product.apresentacao",
      "product.site-editorial",
      "product.site-institucional",
      "product.relatorios",
      "product.outras-interfaces",
    ],
    mask: [ 
      "product.infografico",
    ],
    sprite: [ 
      "goal.educacional",
      "goal.informacional",
      "goal.impacto-positivo",
      "goal.jornalistico-editorial",
      "goal.institucional",
    ]
  } 

  constructor(deliverable: Deliverable, categories: string[]) {
    this.deliverable = deliverable 

    this.context.alpha = 0
    this.context.renderable = false
    this.context.cursor = 'pointer'
    this.context.eventMode = 'none'

    this.context.onpointerenter = this.onpointerenter
    this.context.onpointerleave = this.onpointerleave
    this.context.onpointerup = this.select

    this.context.addChild(this.graphics)
    
    this.graphics.cacheAsBitmap = true

    const baseId = intersection(this.ids.base, categories)[0]
    const bkgrIds = intersection(this.ids.background, categories)
    const frntIds = intersection(this.ids.front, categories)
    const maskIds = intersection(this.ids.mask, categories)
    const sprtIds = intersection(this.ids.sprite, categories)

    bkgrIds.forEach(this.addGraphics)
    this.baseGraphics = this.addGraphics(baseId)
    maskIds.forEach(this.addGraphics)
    frntIds.forEach(this.addGraphics)
    
    this.loading = Promise.all(sprtIds.map(this.addGraphics))

    return this
  }

  public toScene = (scene: PIXI.Container, ticker: PIXI.Ticker) => {
    ticker.add(this.tick)
    scene.addChild(this.context)
  }

  private addGraphics = (id: string) => {
    let graphics

    try {
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
    }
    catch (e) {
      console.log(id, e, this.deliverable.categories)
    }

    return graphics
  } 
    
  private onpointerenter = () => {
    hovered.set(this.deliverable)
  } 

  private onpointerleave = () => {
    hovered.set(null)
  }

  public select = () => {
    selected.set(this.deliverable)
  }

  public toggleEventMode = () => {
    const onSelectedState = !!this.deliverable.simulation.onSelectedState
    const onTransition = this.deliverable.simulation.transition.running
    
    this.context.eventMode = (onSelectedState || onTransition) ? "none" : "dynamic"
  }

  private tick = () => {
    const { fx, fy, rotation, renderable, alpha, scale } = this.deliverable.attr.render

    this.context.alpha = alpha
    this.context.renderable = renderable

    this.context.x = fx
    this.context.y = fy
    this.context.rotation = rotation
    this.context.scale.set(scale) 
  }

  public animateSound() {

    const sprite = getRandomSoundSprite()
    
    sprite.x = this.context.x
    sprite.y = this.context.y

    this.context.parent.addChild(sprite)

    sprite.gotoAndPlay(0)

    sprite.onComplete = () => {
      this.context.parent.removeChild(sprite)
      sprite.destroy()
    }
    
  }
}