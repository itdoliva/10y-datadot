import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"

export default function siteInstitutionalTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  const square = getRegPolyPoints(0, 0, size*.33, 4)
  const triangle = [...square]
  triangle.splice(3, 1)

  template.lineStyle(strokeWidth, 0x000000)
  template.drawPolygon(square.flat())
  template.endFill()

  template.lineStyle(0)
  template.beginFill(0x000000)
  template.drawPolygon(triangle.flat())
  template.endFill()

  return template
}