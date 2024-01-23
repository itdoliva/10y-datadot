import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/store/nodes"


export default function editorialTemplate(template=new PIXI.Graphics()) {
  // Calculate shapes
  const triangle = [
    0, 0, 
    -get(nodeSize)*.33, -get(nodeSize)*.83, 
    get(nodeSize)*.33, -get(nodeSize)*.83
  ]

  const square = [
    -get(nodeSize)*.33, get(nodeSize)*.5,
    get(nodeSize)*.33, get(nodeSize)*.5,
    get(nodeSize)*.33, get(nodeSize)*.66,
    -get(nodeSize)*.33, get(nodeSize)*.66
  ]

  const shapes = [ triangle, square ]

  shapes.forEach(shapePoints => {
    template.lineStyle(get(lineWidth), 0x000000)
    template.drawPolygon(shapePoints)
    template.endFill()
  })

  return template
}

