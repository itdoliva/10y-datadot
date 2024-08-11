import { get } from "svelte/store";
import { gsap } from "gsap";
import * as d3 from "d3"

import Simulation from "./Simulation";
import { cameraOffsetX, cameraOffsetY, zoom } from "../stores/zoom";
import { width, figureHeight, figureWidth } from "../stores/canvas";

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
      
      let r
      
      tl.set(this, { fx, fy, r: 0 })

      if (get(width) < 768) {
        r = Math.max(get(figureWidth), get(figureHeight)) * .95 * (1/get(zoom))
      }
      else {
        const tx = -get(cameraOffsetX)
        const ty = -get(cameraOffsetY)

        r = Math.max(get(figureWidth), get(figureHeight)) * .4
        tl.to(this, { fx: tx, fy: ty, duration: .3, ease: d3.easeQuadInOut })
      }

      tl.to(this, { r, duration: .15, ease: d3.easeCubicInOut }, "<")

      
    }
    else {
      tl.set(this, { r: 0 })
    }
  }

}