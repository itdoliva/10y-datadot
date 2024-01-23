import * as PIXI from "pixi.js"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/store/nodes"


export default function dashboardTemplate(template=new PIXI.Graphics()) {
  template.lineStyle(get(lineWidth), 0x000000)
  template.arc(0, get(nodeSize)*.5, get(nodeSize)*.5, -Math.PI, 0)
  template.closePath()

  template.beginFill(0x000000)
  template.arc(0, get(nodeSize)*.5, get(nodeSize)*.33/2, -Math.PI, 0)
  template.endFill()

  return template
}

