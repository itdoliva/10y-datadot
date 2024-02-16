import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function uiTemplate(template=new PIXI.Graphics()) {
  const uline = [
    -get(nodeSize)*.83, -get(nodeSize)*.5,
    get(nodeSize)*.5, get(nodeSize)*.83
  ]

  const lline = [
    -get(nodeSize)*.83, -get(nodeSize)*.17,
    get(nodeSize)*.17, get(nodeSize)*.83
  ]

  const lines = [ uline, lline ]

  lines.forEach(linePoints => {
    template.lineStyle(get(lineWidth), 0x000000)
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