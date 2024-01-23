import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/store/nodes"


export default function siteEditorialTemplate(template=new PIXI.Graphics()) {

  template.beginFill(0x000000)
  template.lineStyle(0)
  template.arc(0, 0, get(nodeSize)*.33/2, -Math.PI/4, Math.PI/2 + Math.PI/4)
  template.endFill()

  template.lineStyle(get(lineWidth), 0x000000)
  template.drawCircle(0, 0, get(nodeSize)*.33/2)
  template.endFill()

  return template
}
