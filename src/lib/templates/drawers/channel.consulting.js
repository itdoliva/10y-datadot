import * as PIXI from "pixi.js";
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function consultingTemplate(template=new PIXI.Graphics(), size, strokeWidth) {
  if (size === undefined) {
    size = get(nodeSize)
  }

  if (strokeWidth === undefined) {
    strokeWidth = get(lineWidth)
  }
  
  template.beginFill(0xFFFFFF)
  template.lineStyle(strokeWidth, 0x000000)
  template.drawCircle(0, 0, size/2)
  template.endFill()

  return template
}