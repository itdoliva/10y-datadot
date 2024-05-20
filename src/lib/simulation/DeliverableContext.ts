import * as PIXI from "pixi.js"
import { intersection } from "lodash"
import templates from "../templates"


export default class DeliverableContext {
  public context: PIXI.Container
  private graphics: PIXI.Graphics

  private baseGraphics: PIXI.Graphics

  public loading

  private ids = {
    background: [ 20, 21, 23, 24 ],
    base: [ 0, 1, 2 ],
    front: [ 16, 17, 10, 11, 12, 13, 14, 15, 22 ],
    mask: [ 16, 17 ],
    sprite: [ 30, 31, 32, 33, 34 ]
  } 

  constructor(categories: number[]) {
    this.graphics = new PIXI.Graphics()
    this.graphics.cacheAsBitmap = true

    this.context = new PIXI.Container()
    this.context.addChild(this.graphics)

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
}