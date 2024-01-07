import * as PIXI from "pixi.js"


export default function infographicTemplate({ nodeSize, lineWidth }, template=new PIXI.Graphics()) {
  const otriangle = [0, 0, nodeSize*.5, nodeSize*.5, -nodeSize*.5, nodeSize*.5]
  template.lineStyle(lineWidth, 0x000000)
  template.drawPolygon(otriangle)
  template.endFill()

  const itriangle = [0, nodeSize*.33, nodeSize*.16, nodeSize*.5, -nodeSize*.16, nodeSize*.5]
  template.beginFill(0x000000)
  template.drawPolygon(itriangle)
  template.endFill()

  return template
}