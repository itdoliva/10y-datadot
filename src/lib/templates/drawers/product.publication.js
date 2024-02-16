import * as PIXI from "pixi.js"
import getRegPolyPoints from "$lib/helpers/getRegPolyPoints"
import { get } from 'svelte/store';
import { nodeSize, lineWidth } from "$lib/stores/nodes"


export default function publicationTemplate(template=new PIXI.Graphics()) {

  const csquare = getRegPolyPoints(0, 0, get(nodeSize)*.33, 4).flat()
  const usquare = [
    get(nodeSize)*.33/2, -get(nodeSize)*.15,
    get(nodeSize)*.33/2, -get(nodeSize)*.32,
    -get(nodeSize)*.33/2, -get(nodeSize)*.32,
    -get(nodeSize)*.33/2, -get(nodeSize)*.15
  ]

  template.beginFill(0x000000)
  template.lineStyle(get(lineWidth), 0x000000)
  template.drawPolygon(csquare)
  template.endFill()

  template.lineStyle(get(lineWidth), 0x000000)
  template.drawPolygon(usquare)
  template.endFill()

  return template
}