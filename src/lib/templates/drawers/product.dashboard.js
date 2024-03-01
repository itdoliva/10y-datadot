import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function dashboardTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  template.lineStyle(strokeWidth, 0x000000)
  template.arc(0, size*.5, size*.5, -Math.PI, 0)
  template.closePath()

  template.beginFill(0x000000)
  template.arc(0, size*.5, size*.33/2, -Math.PI, 0)
  template.endFill()

  return template
}

