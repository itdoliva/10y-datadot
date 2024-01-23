import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/store/nodes"


export default function serviceTemplate(template=new PIXI.Graphics()) {
  const hline = [ -get(nodeSize)*.8, get(nodeSize)*.33, get(nodeSize)*.86, get(nodeSize)*.33 ]
  const dline = [ -get(nodeSize)*.48, get(nodeSize)*.85, get(nodeSize)*.87, -get(nodeSize)*.5 ]

  const lines = [ hline, dline ]


  template.lineStyle(get(lineWidth), 0x000000)

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

  template.drawCircle(get(nodeSize)*.15, 0, get(nodeSize)*.5)
  template.endFill()

  return template
}
