import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function videoTemplate(template=new PIXI.Graphics()) {
  const triangle = [
    0, 0,
    get(nodeSize)*.12, get(nodeSize)*.2252,
    -get(nodeSize)*.12, get(nodeSize)*.2252,
  ]

  template.lineStyle(get(lineWidth), 0x000000)
  template.drawCircle(0, 0, get(nodeSize)*.33/2)
  template.endFill()

  template.beginFill(0x000000)
  template.drawPolygon(triangle)
  template.endFill()

  return template
}