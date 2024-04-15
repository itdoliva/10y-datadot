import * as PIXI from "pixi.js"
import { get } from 'svelte/store'
import { nodeSize, lineWidth, categories } from "$lib/stores/nodes"
import { pixelRatio } from '$lib/stores/canvas'


export async function goalTemplate(context, {
  goalId
} = {}) {
  const { goals } = get(categories)
  const index = goals.map(d => d.id).indexOf(goalId)
  const goal = goals[index]

  const sprite = await PIXI.Assets.load('petal')
    .then(asset => new PIXI.Sprite(asset))

  sprite.anchor.set(.5, .9)
  sprite.scale.set(get(pixelRatio) / 2)
  sprite.rotation = index * 2*Math.PI / goals.length
  sprite.tint = new PIXI.Color(goal.color).toNumber()
  sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY

  context.addChild(sprite)
  
  return context
}

export function goalTemplateFactory(goalId) {
  return async function (context, {
    anchor = [ .5, .9 ],
    rotateSprite = true
  } = {}) {
    const { goals } = get(categories)
    const index = goals.map(d => d.id).indexOf(goalId)
    const goal = goals[index]
  
    const sprite = await PIXI.Assets.load('petal')
      .then(asset => new PIXI.Sprite(asset))
  
    sprite.anchor.set(...anchor)
    sprite.scale.set(get(nodeSize) / 25)
    sprite.tint = new PIXI.Color(goal.color).toNumber()
    sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY

    if (rotateSprite) {
      sprite.rotation = index * 2*Math.PI / goals.length
    }
    
    context.addChild(sprite)

    return context
  }
}
