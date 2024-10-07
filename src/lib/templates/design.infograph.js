import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function infograph(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  const dline = [ 0, 0, -size*.75, -size*.75 ]
  const lline = [ 
    -size*.75, -size*.75 + size*.15,
    -size*.75, -size*.75, 
    -size*.75 + size*.15, -size*.75 
  ]
  const rline = [ 
    -size*.65, -size*.65 + size*.3, 
    -size*.65, -size*.65, 
    -size*.65 + size*.3, -size*.65, 
  ]

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


  return template
}
