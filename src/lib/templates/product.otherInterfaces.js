import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function otherInterfaces(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }

  const yOffset = size*.15/2

  const utriagnle = [
    -size*.33/2,  0-yOffset,
    size*.33/2,   0-yOffset,
    0,            -size*.15-yOffset,
  ]

  const btriangle = [
    -size*.33/2,  0+yOffset,
    size*.33/2,   0+yOffset,
    0,            -size*.15+yOffset,
  ]

  template.lineStyle(strokeWidth, 0x000000)
  template.drawPolygon(utriagnle)
  template.endFill()

  template.beginFill(0x000000)  
  template.drawPolygon(btriangle)
  template.endFill()
  
  return template
}
