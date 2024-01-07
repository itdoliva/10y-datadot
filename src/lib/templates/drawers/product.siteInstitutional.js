import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints"

export default function siteInstitutionalTemplate({ nodeSize, lineWidth }, template=new PIXI.Graphics()) {
  const square = getRegPolyPoints(0, 0, nodeSize*.33, 4)
  const triangle = [...square]
  triangle.splice(3, 1)

  template.lineStyle(lineWidth, 0x000000)
  template.drawPolygon(square.flat())
  template.endFill()

  template.lineStyle(0)
  template.beginFill(0x000000)
  template.drawPolygon(triangle.flat())
  template.endFill()

  return template
}