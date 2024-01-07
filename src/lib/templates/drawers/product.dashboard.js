import * as PIXI from "pixi.js"


export default function dashboardTemplate({ nodeSize, lineWidth }, template=new PIXI.Graphics()) {

  template.lineStyle(lineWidth, 0x000000)
  template.drawCircle(0, nodeSize*.5, nodeSize*.5)
  template.endFill()

  template.beginFill(0x000000)
  template.drawCircle(0, nodeSize*.5, nodeSize*.33/2)
  template.endFill()

  return template
}





