import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints"


export default function publicationTemplate({ nodeSize, lineWidth }, template=new PIXI.Graphics()) {

  const csquare = getRegPolyPoints(0, 0, nodeSize*.33, 4).flat()
  const usquare = [
    nodeSize*.33/2, -nodeSize*.15,
    nodeSize*.33/2, -nodeSize*.32,
    -nodeSize*.33/2, -nodeSize*.32,
    -nodeSize*.33/2, -nodeSize*.15
  ]

  template.beginFill(0x000000)
  template.lineStyle(lineWidth, 0x000000)
  template.drawPolygon(csquare)
  template.endFill()

  template.lineStyle(lineWidth, 0x000000)
  template.drawPolygon(usquare)
  template.endFill()

  return template
}