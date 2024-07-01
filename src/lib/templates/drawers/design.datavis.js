import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function datavis(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  const dline = [ 0, 0, size*.65, -size*.65 ]
  const lline = [ size*.65, -size*.65, size*.65 - size*.33, -size*.65 ]
  const rline = [ size*.65, -size*.65, size*.65, -size*.65 + size*.33 ]

  const lines = [ dline, lline, rline ]

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

  template.beginFill(0xFFFFFF)  
  template.lineStyle(strokeWidth, 0x000000)
  template.drawCircle(size*.65, -size*.65, size*.15)
  template.endFill()

  return template
}
