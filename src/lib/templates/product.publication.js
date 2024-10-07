import * as PIXI from "pixi.js"
import { getRegPolyPoints } from "$lib/utils/geometry";
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function publicationTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  

  const csquare = getRegPolyPoints(0, 0, size*.33, 4).flat()
  const usquare = [
    size*.33/2, -size*.15,
    size*.33/2, -size*.32,
    -size*.33/2, -size*.32,
    -size*.33/2, -size*.15
  ]

  template.beginFill(0x000000)
  template.lineStyle(strokeWidth, 0x000000)
  template.drawPolygon(csquare)
  template.endFill()

  template.lineStyle(strokeWidth, 0x000000)
  template.drawPolygon(usquare)
  template.endFill()

  return template
}