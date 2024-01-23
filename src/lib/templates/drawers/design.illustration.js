import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/store/nodes"


export default function illustrationTemplate(template=new PIXI.Graphics()) {

  // Calculate edges
  const edges = [
    [0, -get(nodeSize)*.98], //top
    [get(nodeSize)*.84, get(nodeSize)*.84], //right
    [0, get(nodeSize)], // bottom
    [-get(nodeSize)*.84, get(nodeSize)*.84], // left
  ]

  edges.forEach(edge => {
    template.lineStyle(get(lineWidth), 0x000000)
    template.moveTo(0, 0)
    template.lineTo(...edge)
    template.endFill()
  })

  return template
}