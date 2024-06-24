import * as PIXI from "pixi.js"
import { get } from 'svelte/store'
import { nodeSize, categories } from "$lib/stores/nodes"


export function goalTemplateFactory(id) {
  return async function (context, {
    anchor = [ .5, .9 ],
    rotateSprite = true
  } = {}) {
    const goals = get(categories).filter(d => d.type === "goal")
    const index = goals.map(d => d.id).indexOf(id)
    const goal = goals[index]
  
    return PIXI.Assets.load('petal')
    .then(asset => new PIXI.Sprite(asset))
    .then(sprite => {
      sprite.anchor.set(...anchor)
      sprite.scale.set(get(nodeSize) / 25)
      sprite.tint = new PIXI.Color(goal.data.color).toNumber()
      sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY

      if (rotateSprite) {
        sprite.rotation = index * 2*Math.PI / goals.length
      }
      context.addChild(sprite)
    })
  }
}
