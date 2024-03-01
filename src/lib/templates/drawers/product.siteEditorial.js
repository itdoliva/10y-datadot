import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function siteEditorialTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  

  template.beginFill(0x000000)
  template.lineStyle(0)
  template.arc(0, 0, size*.33/2, -Math.PI/4, Math.PI/2 + Math.PI/4)
  template.endFill()

  template.lineStyle(strokeWidth, 0x000000)
  template.drawCircle(0, 0, size*.33/2)
  template.endFill()

  return template
}
