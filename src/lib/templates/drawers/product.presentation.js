import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function presentationTemplate(template=new PIXI.Graphics()) {
  template.lineStyle(get(lineWidth), 0x000000)
  template.drawCircle(0, 0, get(nodeSize)*.33/2)
  template.endFill()

  return template
}