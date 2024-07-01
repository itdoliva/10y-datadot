import Simulation from "./Simulation";
import * as PIXI from "pixi.js"
import rotationOffset from "../utility/rotationOffset";
import { nodeSize } from "../stores/nodes";
import { get } from "svelte/store";
import { _ } from "svelte-i18n"; 

export default class LayoutInterface {
  private simulation: Simulation
  private context = new PIXI.Container()

  private queue: any[] = []

  constructor(simulation: Simulation) {
    this.simulation = simulation
  }

  public toScene(scene: PIXI.Container, ticker: PIXI.Ticker) {
    ticker.add(this.tick)
    scene.addChild(this.context)
  }

  public enqueue(attrId, layoutData) {
    this.queue.push({ 
      id: attrId,
      ...layoutData
    })
  }

  public pop = (attrId: number) => {
    const attrIdx = this.queue.findIndex(d => d.id === attrId)

    if (attrIdx === -1) return

    const attr = this.queue.splice(attrIdx, 1)[0]

    return attr
  }

  public updateLabels(transition) {
    const { attrId } = transition

    const layoutData = this.pop(attrId)

    if (!layoutData) return

    const { sectorName, minRadius } = layoutData

    sectorName.forEach((theta, name) => {
      const wrapper = new PIXI.Container() 
      const inner = new PIXI.Container() 

      const text = new PIXI.Text(name, {
        fontSize: 12,
        align: "center",
      })

      
      text.x = minRadius - text.width - get(nodeSize)/3
      // inner.rotation = Math.PI/2
      wrapper.rotation = theta

      inner.addChild(text)
      wrapper.addChild(inner)
      this.context.addChild(wrapper)
    })

  }

  private tick() {

  }
}