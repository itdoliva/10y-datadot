import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function reportTemplate(template=new PIXI.Graphics()) {
  const square = getRegPolyPoints(0, 0, get(nodeSize)*.33, 4, Math.PI/4).flat()

  template.beginFill(0x000000)
  template.drawPolygon(square)
  template.endFill()

  return template
}