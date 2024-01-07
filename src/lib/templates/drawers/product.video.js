import * as PIXI from "pixi.js"


export default function videoTemplate({ nodeSize, lineWidth }, template=new PIXI.Graphics()) {
  const triangle = [
    0, 0,
    nodeSize*.12, nodeSize*.2252,
    -nodeSize*.12, nodeSize*.2252,
  ]

  template.lineStyle(lineWidth, 0x000000)
  template.drawCircle(0, 0, nodeSize*.33/2)
  template.endFill()

  template.beginFill(0x000000)
  template.drawPolygon(triangle)
  template.endFill()

  return template
}