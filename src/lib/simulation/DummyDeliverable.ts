import { get } from "svelte/store";
import { gsap } from "gsap";
import * as d3 from "d3"

import Simulation from "./Simulation";
import { cameraOffsetX, cameraOffsetY } from "../stores/zoom";
import { figureHeight, figureWidth } from "../stores/canvas";

export default class DummyDeliverable {
  public simulation: Simulation

  public id: number = -1
  public fx: number = 0
  public fy: number = 0
  public r: number = 0

  constructor(simulation: Simulation) {
    this.simulation = simulation
  }

  public radius = () => this.r

  public tick = () => {}

  public handleSelected = (selected) => {
    const tl = gsap.timeline({ overwrite: "auto", onUpdate: this.simulation.updateForceCollideRadius })

    if (selected) {
      const { fx, fy } = selected.attr.render
      const tx = -get(cameraOffsetX)
      const ty = -get(cameraOffsetY)
      const tr = Math.max(get(figureWidth), get(figureHeight)) * .4

      tl
      .fromTo(this, 
        { fx, fy },
        { fx: tx, fy: ty, duration: .3, ease: d3.easeQuadInOut })
      .fromTo(this,
        { r: 0 },
        { r: tr, duration: .15, ease: d3.easeCubicInOut }, "<")
    }
    else {
      tl.set(this, { r: 0 })
    }
  }

}