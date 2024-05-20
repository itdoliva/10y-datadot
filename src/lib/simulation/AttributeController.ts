import { isEqual } from "lodash"
import { get } from "svelte/store";
import { complexityOn, figureHeight, figureWidth } from "../stores/canvas";

import Deliverable from "./Deliverable"
import Simulation, { c } from "./Simulation"
import { Layout, Coordinates, LayoutAttributes, RenderAttributes } from "../types/simulation"

export default class AttributeController {
  private simulation: Simulation
  private deliverable: Deliverable

  public cur: LayoutAttributes
  public prev: LayoutAttributes
  public tweened: Coordinates
  public render: RenderAttributes

  constructor(deliverable: Deliverable) {
    this.deliverable = deliverable
    this.simulation = deliverable.simulation
  }

  public set(newAttr: LayoutAttributes) {
    if (isEqual(newAttr, this.cur)) return

    this.prev = this.cur
    this.cur = newAttr
  }

  public getTweenCoordinates() {
    let tweenX: number
    let tweenY: number

    const { x, y, theta, radius } = this.tweened

    if (this.deliverable.simulation.layout === "block") {
      tweenX = x
      tweenY = y
    }
    else {
      tweenX = Math.cos(theta) * radius + x
      tweenY = Math.sin(theta) * radius + y
    }

    return { tweenX, tweenY }
  }
  
  public playEntrance() {
    const { x, y, theta, radius, time } = this.cur
    const delay = time

    const active = this.deliverable.active

    const tl = gsap.timeline({ overwrite: true })

    if (this.simulation.layout === "block") {
      tl
      .set(this.tweened, { x, y, radius, theta })
      .set(this.render, { alpha: 0, rotation: 0, renderable: active })
      .set(this.render, { alpha: 1 }, delay.toFixed(2))
    }

    else {
      const duration = c.maxDurationRadial
      const ease = c.easeEntrance

      tl
      .set(this.tweened, { x: 0, y: 0, radius: radius - 24, theta: theta - Math.PI/8 })
      .set(this.render, { alpha: 0, rotation: theta + Math.PI, renderable: active })
      .to(this.tweened, { radius, theta, delay, duration, ease })
      .to(this.cur, { alpha: 1, rotation: theta + Math.PI, duration, ease }, "<")
    }

    tl.eventCallback("onComplete", () => { tl.kill() })
    tl.eventCallback("onInterrupt", () => { tl.kill() })

    return tl
  }

  public playExit() {
    const delayFall = Math.random() * .5
    const delayFadeOut = Math.max(0, delayFall - Math.random()*.15)
    const duration = c.shifts - delayFall - (Math.random() * .3)

    console.log(this.tweened, this.cur)
    const curY = this.tweened?.y ? this.tweened.y : this.cur.y

    const y = curY + get(figureHeight)*(Math.random()*.5 + .3)

    const tl = gsap.timeline({ overwrite: true })

    tl.to(this.render, { alpha: 0, duration, delay: delayFadeOut, ease: c.easeFade })
    tl.to(this.tweened, { y, duration, delay: delayFall - delayFadeOut, ease: c.easeExit }, "<")

    tl.eventCallback("onComplete", () => { tl.kill() })
    tl.eventCallback("onInterrupt", () => { tl.kill() })
  }

  public playFilterIn() {

  }

  public playFilterOut() {

  }

  public playSort() {

  }

  public playSelected() {

  }
}