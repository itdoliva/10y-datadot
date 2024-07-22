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
  private soundAnimation
  

  private baseGraphics: PIXI.Graphics

  public loading

  private ids = {
    background: [ 
      "design.user-interface",
      "design.datavis",
      "design.ilustracao",
      "design.design-de-servicos",
      "design.editorial",
      "design.infografia",
      "design.motion-graphics",
    ],
    base: [ 
      "channel.digital",
      "channel.impressa",
      "channel.consultoria"
    ],
    front: [ 
      "product.site-editorial",
      "product.outras-interfaces",
      "product.relatorios",
      "product.apresentacao",
      "product.publicacao",
      "product.site-institucional",
      "product.video",
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
    const sprtIds = intersection(this.ids.sprite, categories)


    bkgrIds.forEach(this.addGraphics)
    this.baseGraphics = this.addGraphics(baseId)
    frntIds.forEach(this.addGraphics)
    
    this.loading = Promise.all(sprtIds.map(this.addGraphics))

    PIXI.Assets.load("soundFX")
      .then(asset => {
        const animation = new PIXI.AnimatedSprite(asset.animations.tile)

        animation.anchor.x = .5
        animation.anchor.y = .5
        animation.loop = false
        animation.zIndex = 10
        animation.blendMode = PIXI.BLEND_MODES.MULTIPLY
        
        this.context.addChild(animation)

        this.soundAnimation = animation
      })

    return this
  }

  public toScene = (scene: PIXI.Container, ticker: PIXI.Ticker) => {
    ticker.add(this.tick)
    scene.addChild(this.context)
  }

  private addGraphics = (id: string) => {
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

  public animateSound(params) {
    const tints = [
      0x828AFA,
      0xCEFD6C,
      0x6D9DFC,
      0xFC826D,
      0xFAF982,      
    ]

    const angle = [
      0,
      135,
      255,
    ]

    this.soundAnimation.tint = tints[Math.floor(Math.random() * tints.length)]
    this.soundAnimation.angle = angle[Math.floor(Math.random() * angle.length)]
    this.soundAnimation.gotoAndPlay(0)
  }
}