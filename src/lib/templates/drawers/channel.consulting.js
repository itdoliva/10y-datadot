import * as PIXI from "pixi.js"


export default function consultingTemplate({ nodeSize, lineWidth }, template=new PIXI.Graphics()) {
  template.beginFill(0xFFFFFF)
  template.lineStyle(lineWidth, 0x000000)
  template.drawCircle(0, 0, nodeSize/2)
  template.endFill()

  return template
}