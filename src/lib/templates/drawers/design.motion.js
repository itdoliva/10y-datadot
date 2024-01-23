import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/store/nodes"


export default function motionTemplate(template=new PIXI.Graphics()) {
  template.lineStyle(get(lineWidth), 0x000000)
  template.moveTo(-get(nodeSize)*.17, get(nodeSize)*.83)
  template.lineTo(get(nodeSize)*.83, -get(nodeSize)*.17)
  template.endFill()

  template.beginFill(0xFFFFFF)
  template.lineStyle(get(lineWidth), 0x000000)
  template.drawCircle(get(nodeSize)*.33, get(nodeSize)*.33, get(nodeSize)*.33/2)
  template.endFill()

  return template
}