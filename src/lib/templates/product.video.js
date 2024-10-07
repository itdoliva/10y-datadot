import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function videoTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  const triangle = [
    0, 0,
    size*.12, size*.2252,
    -size*.12, size*.2252,
  ]

  template.lineStyle(strokeWidth, 0x000000)
  template.drawCircle(0, 0, size*.33/2)
  template.endFill()

  template.beginFill(0x000000)
  template.drawPolygon(triangle)
  template.endFill()

  return template
}