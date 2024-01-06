import * as PIXI from "pixi.js"


export default function motionTemplate({ nodeSize, lineWidth }, template) {
  template.lineStyle(lineWidth, 0x000000)
  template.moveTo(-nodeSize*.17, nodeSize*.83)
  template.lineTo(nodeSize*.83, -nodeSize*.17)
  template.endFill()

  template.beginFill(0xFFFFFF)
  template.lineStyle(lineWidth, 0x000000)
  template.drawCircle(nodeSize*.33, nodeSize*.33, nodeSize*.33/2)
  template.endFill()

  return template
}