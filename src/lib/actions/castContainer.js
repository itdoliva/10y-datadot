import { get } from "svelte/store";
import { app } from "$lib/stores/canvas";
import * as PIXI from "pixi.js"

export default function castContainer(node, { 
  context, 
  parent=get(app).stage, 
  hasMask=false,
  destroy=true
}) {

  if (!context) {
    return
  }

  // Add container to parent
  parent.addChild(context)

  // Add mask if requested
  let mask
  if (hasMask) {
    mask = new PIXI.Graphics()
    mask.name = 'mask'

    context.mask = mask
    parent.addChild(mask)
  }

  const ticker = get(app).ticker.add(ticked)

  function ticked() {
    const bbox = node.getBoundingClientRect()

    const x = bbox.x + bbox.width/2 - parent.x
    const y = bbox.y + bbox.height/2 - parent.y

    context.x = x
    context.y = y

    if (hasMask) {
      mask.x = x
      mask.y = y

      mask.clear()
      mask.beginFill(0x000000)
      mask.drawRect(-bbox.width/2, -bbox.height/2, bbox.width, bbox.height)
      mask.endFill()
    }
  }


  return {
    destroy: () => {
      if (destroy) {
        ticker.remove(ticked)
        context.destroy({ children: true })
  
        if (hasMask) {
          mask.destroy()
        }
      }
    }
  }
}