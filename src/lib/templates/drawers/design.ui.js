import * as PIXI from "pixi.js"


export default function uiTemplate({ nodeSize, lineWidth }, template) {
  const uline = [
    -nodeSize*.83, -nodeSize*.5,
    nodeSize*.5, nodeSize*.83
  ]

  const lline = [
    -nodeSize*.83, -nodeSize*.17,
    nodeSize*.17, nodeSize*.83
  ]

  const lines = [ uline, lline ]

  lines.forEach(linePoints => {
    template.lineStyle(lineWidth, 0x000000)
    for (let i=0; i<linePoints.length; i+=2) {
      const points = linePoints.slice(i, i+2)
      if (i === 0) {
        template.moveTo(...points)
      } else {
        template.lineTo(...points)
      }
    }
    template.endFill()
  })
  return template
}