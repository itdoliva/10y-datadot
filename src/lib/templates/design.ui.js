import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function uiTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  const uline = [
    -size*.83, -size*.5,
    size*.5, size*.83
  ]

  const lline = [
    -size*.83, -size*.17,
    size*.17, size*.83
  ]

  const lines = [ uline, lline ]

  lines.forEach(linePoints => {
    template.lineStyle(strokeWidth, 0x000000)
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