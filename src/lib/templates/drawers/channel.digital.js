import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints";
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function digitalTemplate(template=new PIXI.Graphics()) {
  const points = getRegPolyPoints(0, 0, get(nodeSize), 4).flat()
  
  template.beginFill(0xFFFFFF)
  template.lineStyle(get(lineWidth), 0x000000)
  template.drawPolygon(points)
  template.endFill()

  return template
}