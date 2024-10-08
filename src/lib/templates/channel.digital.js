import * as PIXI from "pixi.js"
import { getRegPolyPoints } from "$lib/utils/geometry";
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function digitalTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  const points = getRegPolyPoints(0, 0, size, 4).flat()
  
  template.beginFill(0xFFFFFF)
  template.lineStyle(strokeWidth, 0x000000)
  template.drawPolygon(points)
  template.endFill()

  return template
}