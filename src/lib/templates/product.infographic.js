import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function infographicTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  const otriangle = [0, 0, size*.5, size*.5, -size*.5, size*.5]
  template.lineStyle(strokeWidth, 0x000000)
  template.drawPolygon(otriangle)
  template.endFill()

  const itriangle = [0, size*.33, size*.16, size*.5, -size*.16, size*.5]
  template.beginFill(0x000000)
  template.drawPolygon(itriangle)
  template.endFill()

  return template
}