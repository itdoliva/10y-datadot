import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function motionTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  template.lineStyle(strokeWidth, 0x000000)
  template.moveTo(-size*.17, size*.83)
  template.lineTo(size*.83, -size*.17)
  template.endFill()

  template.beginFill(0xFFFFFF)
  template.lineStyle(strokeWidth, 0x000000)
  template.drawCircle(size*.33, size*.33, size*.33/2)
  template.endFill()

  return template
}