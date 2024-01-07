import * as PIXI from "pixi.js"


export default function editorialTemplate({ nodeSize, lineWidth }, template=new PIXI.Graphics()) {
  // Calculate shapes
  const triangle = [
    0, 0, 
    -nodeSize*.33, -nodeSize*.83, 
    nodeSize*.33, -nodeSize*.83
  ]

  const square = [
    -nodeSize*.33, nodeSize*.5,
    nodeSize*.33, nodeSize*.5,
    nodeSize*.33, nodeSize*.66,
    -nodeSize*.33, nodeSize*.66
  ]

  const shapes = [ triangle, square ]

  shapes.forEach(shapePoints => {
    template.lineStyle(lineWidth, 0x000000)
    template.drawPolygon(shapePoints)
    template.endFill()
  })

  return template
}

