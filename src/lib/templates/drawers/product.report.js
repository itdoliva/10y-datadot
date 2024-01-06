import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints"


export default function reportTemplate({ nodeSize, lineWidth }, template) {
  const square = getRegPolyPoints(0, 0, nodeSize*.33, 4, Math.PI/4).flat()

  template.beginFill(0x000000)
  template.drawPolygon(square)
  template.endFill()

  return template
}