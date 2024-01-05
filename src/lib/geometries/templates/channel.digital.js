import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints";


export default function digitalTemplate({ nodeSize, lineWidth }) {
  const points = getRegPolyPoints(0, 0, nodeSize, 4).flat()

  const template = new PIXI.Graphics()
  
  template.beginFill(0xFFFFFF)
  template.lineStyle(lineWidth, 0x000000)
  template.drawPolygon(points)
  template.endFill()

  return template
}