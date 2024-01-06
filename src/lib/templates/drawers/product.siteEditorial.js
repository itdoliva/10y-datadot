import * as PIXI from "pixi.js"


export default function siteEditorialTemplate({ nodeSize, lineWidth }, template) {

  template.beginFill(0x000000)
  template.lineStyle(0)
  template.arc(0, 0, nodeSize*.33/2, -Math.PI/4, Math.PI/2 + Math.PI/4)
  template.endFill()

  template.lineStyle(lineWidth, 0x000000)
  template.drawCircle(0, 0, nodeSize*.33/2)
  template.endFill()

  return template
}
