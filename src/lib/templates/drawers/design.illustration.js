import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function illustrationTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  

  // Calculate edges
  const edges = [
    [0, -size*.98], //top
    [size*.84, size*.84], //right
    [0, size], // bottom
    [-size*.84, size*.84], // left
  ]

  edges.forEach(edge => {
    template.lineStyle(strokeWidth, 0x000000)
    template.moveTo(0, 0)
    template.lineTo(...edge)
    template.endFill()
  })

  return template
}