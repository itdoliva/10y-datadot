import * as PIXI from "pixi.js";
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/store/nodes"


export default function consultingTemplate(template=new PIXI.Graphics()) {
  template.beginFill(0xFFFFFF)
  template.lineStyle(get(lineWidth), 0x000000)
  template.drawCircle(0, 0, get(nodeSize)/2)
  template.endFill()

  return template
}