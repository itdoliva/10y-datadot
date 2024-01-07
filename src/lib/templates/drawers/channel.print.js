import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints";


export default function printTemplate({ nodeSize, lineWidth }, template=new PIXI.Graphics()) {
  const points = getRegPolyPoints(0, 0, nodeSize, 6).flat()

  template.beginFill(0xFFFFFF)
  template.lineStyle(lineWidth, 0x000000, 1)
  template.drawPolygon(points)
  template.endFill()

  return template
}