import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function serviceTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  const hline = [ -size*.8, size*.33, size*.86, size*.33 ]
  const dline = [ -size*.48, size*.85, size*.87, -size*.5 ]

  const lines = [ hline, dline ]


  template.lineStyle(strokeWidth, 0x000000)

  lines.forEach(linePoints => {
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

  template.drawCircle(size*.15, 0, size*.5)
  template.endFill()

  return template
}
