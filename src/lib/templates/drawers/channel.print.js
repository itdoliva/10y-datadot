import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints";
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function printTemplate(template=new PIXI.Graphics()) {
  const points = getRegPolyPoints(0, 0, get(nodeSize), 6).flat()

  template.beginFill(0xFFFFFF)
  template.lineStyle(get(lineWidth), 0x000000, 1)
  template.drawPolygon(points)
  template.endFill()

  return template
}