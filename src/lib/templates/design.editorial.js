import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function editorialTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  // Calculate shapes
  const triangle = [
    0, 0, 
    -size*.33, -size*.83, 
    size*.33, -size*.83
  ]

  const square = [
    -size*.33, size*.5,
    size*.33, size*.5,
    size*.33, size*.66,
    -size*.33, size*.66
  ]

  const shapes = [ triangle, square ]

  shapes.forEach(shapePoints => {
    template.lineStyle(strokeWidth, 0x000000)
    template.drawPolygon(shapePoints)
    template.endFill()
  })

  return template
}

