import { get } from "svelte/store";
import { app } from "$lib/stores/canvas";
import * as PIXI from "pixi.js"
import _ from "lodash"

// Casts a DOM elements to the WebGL Canvas
// It's useful to position and mask canvas elements by using other DOM element

export default function castContainer(node, { 
  context, 
  parent=get(app).stage, 
  hasMask=false,
  destroy=true,
  centered=true,
  propagateOpacity=false
} = {}) {


  if (!context) {
    return
  }

  // Add container to parent
  parent.addChild(context)


  // Add mask if requested
  let mask
  if (hasMask) {
    mask = new PIXI.Graphics()
    mask.name = 'cast-container-mask'
    context.mask = mask
    context.addChild(mask)
  }

  const ticker = get(app).ticker.add(ticked)

  function ticked() {
    const bbox = node.getBoundingClientRect()

    let xOffset = 0
    let yOffset = 0

    if (centered) {
      xOffset += bbox.width/2
      yOffset += bbox.height/2
    }

    const x = bbox.x - parent.x + xOffset
    const y = bbox.y - parent.y + yOffset

    context.x = x
    context.y = y

    if (propagateOpacity) {
      let el = node
      
     if (_.isString(propagateOpacity)) {
        el = document.querySelector(propagateOpacity)
      }
      else if (!_.isBoolean(propagateOpacity)) {
        el = propagateOpacity
      }

      context.alpha = window.getComputedStyle(el).opacity
    }

    if (hasMask) {
      mask.clear()
      mask.beginFill(0x000000)
      mask.drawRect(-xOffset, -yOffset, bbox.width, bbox.height)
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