import Simulation from "./Simulation";
import * as PIXI from "pixi.js"
import rotationOffset from "../utility/rotationOffset";
import { nodeSize } from "../stores/nodes";
import { get } from "svelte/store";
import { _ } from "svelte-i18n"; 
import gsap from "gsap";
import { LayoutData } from "../types/simulation";
import getFontSizeLabel from "../utility/getFontSizeLabel";

export default class LayoutInterface {
  private simulation: Simulation
  private context = new PIXI.Container()

  private cur: LayoutData
  private prev: LayoutData

  private nodes: any[] = []

  private queue: any[] = []

  constructor(simulation: Simulation) {
    this.simulation = simulation
  }

  public toScene(scene: PIXI.Container, ticker: PIXI.Ticker) {
    ticker.add(this.tick)
    scene.addChild(this.context)
  }

  public enqueue(attrId: number, layoutData: LayoutData) {
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


  public setInterfaceLabels(transition) {

    // Fade out and destroy current labels
    while (this.nodes.length) {
      const node = this.nodes.pop()
      const { outer } = node.context

      gsap.timeline({ overwrite: true })
        .to(outer, { alpha: 0, duration: .250 })
        .call(() => {
          outer.destroy({ children: true })
        })
    }

    const { type, attrId } = transition

    if (attrId) {
      this.prev = this.cur
      this.cur = this.pop(attrId)
    }

    if (!this.cur || type === "exit") return


    const { sectorTitleData, minRadius } = this.cur

    sectorTitleData.forEach(({ title, thetaMin }, i) => {
      const outer = new PIXI.Container() 
      const inner = new PIXI.Container() 
      const text = new PIXI.Text('', { 
        fontSize: getFontSizeLabel(), 
        fontFamily: [ 'Rational', 'monospace' ],
        fontWeight: '300'
      })

      const node = {
        title,
        thetaMin,
        context: {
          outer,
          inner,
          text
        },
      }

      this.nodes.push(node)

      text.alpha = 0
      inner.x = minRadius + get(nodeSize) * 1.5
      inner.y = -get(nodeSize) * 1.75
      outer.rotation = thetaMin

      const ease = "power2.out"

      gsap.timeline()
        .to(text, { 
          alpha: 1, 
          duration: 1, 
          delay: .75, 
          ease
        })
        .from(outer, { 
          rotation: thetaMin-Math.PI/16, 
          duration: 1, 
          ease
         }, '<')


      inner.addChild(text)
      outer.addChild(inner)
      this.context.addChild(outer)

    })

    this.updateText()

  }

  public updateText() {
    if (!this.cur) return

    this.nodes.forEach(({ title, thetaMin, context }) => {

      const label = (this.cur.translate ? get(_)(title) : title)
        .toLowerCase()

      const text = <PIXI.Text>context.text
      text.text = label

      if (thetaMin >= Math.PI/2 && thetaMin <= 3*Math.PI/2) {
        text.pivot.set(text.width, text.height)
        text.rotation = Math.PI
        text.style.align = 'right'
      }
      else {
        text.style.align = 'left'
      }

    })

  }

  private tick() {

  }
}