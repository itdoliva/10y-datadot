import { get } from "svelte/store";
import { app } from "$lib/stores/canvas";
import * as PIXI from "pixi.js"

export default function castContainer(node, { 
  container, 
  parent=get(app).stage, 
  hasMask=false 
}) {

  if (!container) {
    return
  }

  // Add container to parent
  parent.addChild(container)

  // Add mask if requested
  let mask
  if (hasMask) {
    mask = new PIXI.Graphics()
    mask.name = 'mask'

    container.mask = mask
    parent.addChild(mask)
  }

  get(app).ticker.add(() => {
    const bbox = node.getBoundingClientRect()

    const x = bbox.x + bbox.width/2
    const y = bbox.y + bbox.height/2

    container.x = x
    container.y = y

    if (hasMask) {
      mask.x = x
      mask.y = y

      mask.clear()
      mask.beginFill(0x000000)
      mask.drawRect(-bbox.width/2, -bbox.height/2, bbox.width, bbox.height)
      mask.endFill()
    }
  })

  return {
    destroy: () => container.destroy()
  }
}