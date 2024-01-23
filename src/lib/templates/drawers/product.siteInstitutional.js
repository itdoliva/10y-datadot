import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/store/nodes"

export default function siteInstitutionalTemplate(template=new PIXI.Graphics()) {
  const square = getRegPolyPoints(0, 0, get(nodeSize)*.33, 4)
  const triangle = [...square]
  triangle.splice(3, 1)

  template.lineStyle(get(lineWidth), 0x000000)
  template.drawPolygon(square.flat())
  template.endFill()

  template.lineStyle(0)
  template.beginFill(0x000000)
  template.drawPolygon(triangle.flat())
  template.endFill()

  return template
}