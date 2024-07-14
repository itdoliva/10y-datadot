import Simulation from "./Simulation";
import * as PIXI from "pixi.js"
import rotationOffset from "../utility/rotationOffset";
import { nodeSize } from "../stores/nodes";
import { get } from "svelte/store";
import { _ } from "svelte-i18n"; 
import gsap from "gsap";
import { LayoutData } from "../types/simulation";
import getFontSizeLabel from "../utility/getFontSizeLabel";

const ease = "power2.out"

class LayoutLabel {
  private outer: PIXI.Container
  private inner: PIXI.Container
  private text: PIXI.Text

  private translate: boolean
  private title: string
  private theta: number

  private entranceTl: gsap.core.Timeline

  constructor(parent: PIXI.Container, sectorTitleData: { title: string; thetaMin: number; }, radius: number, translate: boolean) {
    this.translate = translate
    this.title = sectorTitleData.title
    this.theta = sectorTitleData.thetaMin

    this.outer = new PIXI.Container()
    this.inner = new PIXI.Container()
    this.text = new PIXI.Text('', {
      fontSize: getFontSizeLabel(),
      fontFamily: [ 'Rational', 'monospace' ],
      fontWeight: '300'
    })

    this.text.alpha = 0
    this.inner.x = radius + get(nodeSize) * 1.5
    this.inner.y = -get(nodeSize) * 1.75
    this.outer.rotation = this.theta

    this.inner.addChild(this.text)
    this.outer.addChild(this.inner)
    parent.addChild(this.outer)

    this.enter()

    return this
  }

  public enter() {
    this.updateText()

    this.entranceTl = gsap.timeline()
      .to(this.text, { 
        alpha: 1, 
        duration: 1, 
        delay: .75, 
        ease
      })
      .from(this.outer, { 
        rotation: this.theta-Math.PI/16, 
        duration: 1, 
        ease
      }, '<')

    console.groupEnd()
  }

  public toggleOpacity(to: number) {
    gsap.to(this.outer, { 
      alpha: to, 
      duration: .250, 
      ease
    })
  }

  public exit() {
    if (this.entranceTl.isActive()) {
      this.entranceTl.kill()
    }
      
    gsap.timeline({ overwrite: true })
      .to(this.outer, { 
        alpha: 0, 
        duration: .250 
      }, "<")
      .call(() => {
        this.outer.destroy({ children: true })
      })
  }

  public updateText() {
    const { translate, title, text, theta } = this

    text.text = (translate ? get(_)(title) : title).toLowerCase()

    if (theta >= Math.PI/2 && theta <= 3*Math.PI/2) {
      text.pivot.set(text.width, text.height)
      text.rotation = Math.PI
      text.style.align = 'right'
    }
    else {
      text.style.align = 'left'
    }
  }
}

export default class LayoutInterface {
  private simulation: Simulation
  private context = new PIXI.Container()

  private cur: LayoutData
  private prev: LayoutData

  private nodes: LayoutLabel[] = []

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

  public toggleOpacity(to) {
    this.nodes.forEach(node => node.toggleOpacity(to))
  }

  public pop = (attrId: number) => {
    const attrIdx = this.queue.findIndex(d => d.id === attrId)

    if (attrIdx === -1) return

    const attr = this.queue.splice(attrIdx, 1)[0]

    return attr
  }


  public setInterfaceLabels(transition) {
    console.log('setInterfaceLabels')

    // Fade out and destroy current labels
    while (this.nodes.length) {
      const node = this.nodes.pop()
      
      if (node) {
        node.exit()
      }
    }

    const { type, attrId } = transition

    if (attrId) {
      this.prev = this.cur
      this.cur = this.pop(attrId)
    }

    if (!this.cur || type === "exit") return

    const { sectorTitleData, minRadius, translate } = this.cur

    sectorTitleData.forEach((sectorTitleDataPoint, i) => {
      const layoutLabel = new LayoutLabel(this.context, sectorTitleDataPoint, minRadius, translate)
      this.nodes.push(layoutLabel)
    })


  }

  public updateText() {
    console.log('updateText')
    if (!this.cur) return

    this.nodes.forEach((node) => {
      node.updateText()
    })

  }

  private tick() {

  }
}