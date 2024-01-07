import * as PIXI from "pixi.js"


export default function presentationTemplate({ nodeSize, lineWidth }, template=new PIXI.Graphics()) {
  template.lineStyle(lineWidth, 0x000000)
  template.drawCircle(0, 0, nodeSize*.33/2)
  template.endFill()

  return template
}