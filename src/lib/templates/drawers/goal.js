import * as PIXI from "pixi.js"
import { get } from 'svelte/store'
import { nodeSize, categories } from "$lib/stores/nodes"


export function goalTemplateFactory(goalId) {
  return async function (context, {
    anchor = [ .5, .9 ],
    rotateSprite = true
  } = {}) {
    const { goals } = get(categories)
    const index = goals.map(d => d.id).indexOf(goalId)
    const goal = goals[index]
  
    return PIXI.Assets.load('petal')
    .then(asset => new PIXI.Sprite(asset))
    .then(sprite => {
      sprite.anchor.set(...anchor)
      sprite.scale.set(get(nodeSize) / 25)
      sprite.tint = new PIXI.Color(goal.color).toNumber()
      sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY

      if (rotateSprite) {
        sprite.rotation = index * 2*Math.PI / goals.length
      }
      context.addChild(sprite)
    })
  }
}
