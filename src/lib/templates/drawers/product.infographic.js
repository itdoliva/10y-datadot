import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/store/nodes"


export default function infographicTemplate(template=new PIXI.Graphics()) {
  const otriangle = [0, 0, get(nodeSize)*.5, get(nodeSize)*.5, -get(nodeSize)*.5, get(nodeSize)*.5]
  template.lineStyle(get(lineWidth), 0x000000)
  template.drawPolygon(otriangle)
  template.endFill()

  const itriangle = [0, get(nodeSize)*.33, get(nodeSize)*.16, get(nodeSize)*.5, -get(nodeSize)*.16, get(nodeSize)*.5]
  template.beginFill(0x000000)
  template.drawPolygon(itriangle)
  template.endFill()

  return template
}