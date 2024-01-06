import * as PIXI from "pixi.js"


export default function illustrationTemplate({ nodeSize, lineWidth }, template) {

  // Calculate edges
  const edges = [
    [0, -nodeSize*.98], //top
    [nodeSize*.84, nodeSize*.84], //right
    [0, nodeSize], // bottom
    [-nodeSize*.84, nodeSize*.84], // left
  ]

  edges.forEach(edge => {
    template.lineStyle(lineWidth, 0x000000)
    template.moveTo(0, 0)
    template.lineTo(...edge)
    template.endFill()
  })

  return template
}