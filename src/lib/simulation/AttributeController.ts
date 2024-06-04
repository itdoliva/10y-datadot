import _ from "lodash";
import { get } from "svelte/store";
import { gsap } from "gsap";
import * as d3 from "d3";

import { complexityOn, figureHeight } from "../stores/canvas";

import Deliverable from "./Deliverable"
import Simulation, { c } from "./Simulation"
import NodeAttributes from "./NodeAttributes";

import { TransitionType, IRenderAttributes, ITransition } from "../types/simulation"

const rotationOffset = (theta: number) => theta + Math.PI/2

export default class AttributeController {
  private simulation: Simulation
  private deliverable: Deliverable

  public cur: NodeAttributes
  public prev: NodeAttributes

  public queue: NodeAttributes[] = []
  
  public render: IRenderAttributes = {
    fx: 0,
    fy: 0,

    px: 0,
    py: 0,
    theta: 0,
    radius: 0,

    rotation: 0,
    alpha: 1,
    scale: 1,
    renderable: false
  }


  constructor(deliverable: Deliverable) {
    this.deliverable = deliverable
    this.simulation = deliverable.simulation
  }

  public set = (attr: NodeAttributes) => {
    this.queue.push(attr)
  }

  public pop = (attrId: number) => {
    const attrIdx = this.queue.findIndex(d => d.id === attrId)
    const attr = this.queue.splice(attrIdx, 1)[0]

    return attr
  }

  public scale = () => {
    return get(complexityOn)
      ? this.deliverable.complexity
      : 1
  }


  // Transitions
  public play(transition: ITransition) {
    const { type, attrId, layout } = transition

    if (attrId) {
      this.prev = this.cur
      this.cur = this.pop(attrId)
    }

    return this[type](layout === "block")
  }

  public makeTimeline = (forTransitionType:TransitionType|undefined=undefined, overwrite="auto") => {

    const onComplete = () => {
      tl.kill()
    }

    const tl = gsap.timeline({ 
      overwrite,
      onComplete,
      onInterrupt: onComplete
    })

    return tl
  }
  
  public entrance = (isBlock: boolean) => {
    const active = this.cur.active
    const { x, y, theta, radius, time } = this.cur
    const delay = time

    const tl = this.makeTimeline("entrance")

    if (isBlock) {
      tl
      .set(this.render, { px: x, py: y, radius, theta, alpha: 0, rotation: 0 })
      .set(this.render, { renderable: active, delay: .05 })
      .set(this.render, { alpha: 1, delay: delay })
    }

    else {
      tl
      .set(this.render, { 
        px: 0, py: 0, 
        radius: radius - 24, 
        theta: theta - Math.PI/8, 
        alpha: 0, 

        rotation: rotationOffset(theta - Math.PI/8),
        renderable: active 
      })
      .to(this.render, { 
        radius, 
        theta, 
        alpha: 1,
        rotation: rotationOffset(theta),

        delay, 
        duration: c.maxDurationRadial, 
        ease: "power3.inOut"
      })
    }

    return tl
  }

  public exit = () => {

    const yOffset = get(figureHeight) * (Math.random()*.5 + .3)
    
    const delay = Math.random() * .5
    const duration = c.shifts - delay - (Math.random() * .3)
    
    const tl = this.makeTimeline("exit")
    
    this.simulation.onSelectedState
      ? tl.fromTo(this.render, { py: 0 }, { py: yOffset, alpha: 0, duration, delay, ease: "power1.in" })
      : tl.to(this.render, { py: this.render.py + yOffset, alpha: 0, duration, delay, ease: "power1.in" })

    return tl
  }

  public filterIn = (isBlock: boolean) => {
    const tl = this.makeTimeline("filterIn")

    const isEntering = !this.prev.active && this.cur.active

    if (isBlock) {
      // Waterfall in
      if (isEntering) {
        tl
        .set(this.render, { px: this.cur.x, py: this.cur.y })
        .set(this.render, { 
          renderable: this.cur.active, 
          delay: (this.cur.time * c.filterDuration) + c.filterHalf1 + c.filterBetweenGap 
        })
      }
  
      // Move existing
      else {
        tl.to(this.render, {
          px: this.cur.x,
          py: this.cur.y,
  
          ease: d3.easeQuadInOut,
          duration: c.filterHalf2,
          delay: this.prev.time * c.filterHalf1
        })
      }
    }

    else {
      tl
      // Fade out and rotate back
      .to(this.render, {
        alpha: 0,
        theta: this.prev.theta - Math.PI/24,
        rotation: rotationOffset(this.prev.theta - Math.PI/24),
        radius: this.prev.radius + 24,

        duration: .15,
        ease: d3.easeQuadInOut,
        delay: d3.easeQuadInOut(this.cur.time) * c.filterHalf1
      })

      // Fade in and rotate towards
      .set(this.render, {
        alpha: 0,
        theta: this.cur.theta - Math.PI/24,
        radius: this.cur.radius,
        rotation: rotationOffset(this.cur.theta - Math.PI/24),
      })
      .set(this.render, {
        renderable: this.cur.active,
        delay: .05,
      }) // This prevents pokemons blinking at the center of the screen
      .to(this.render, {
        theta: this.cur.theta,
        rotation: rotationOffset(this.cur.theta),
        alpha: 1,
        
        duration: .15,
        ease: d3.easeQuadInOut,
        delay: d3.easeQuadInOut(this.cur.time) * c.filterHalf2
      })
    }

    return tl
  }

  public filterOut = (isBlock: boolean) => {
    const tl = this.makeTimeline("filterOut")

    if (isBlock) {
      const active = this.cur.active
      const delay = this.prev.time * c.filterDuration

      tl
      .set(this.render, { renderable: active, delay })
      .to(this.render, { 
        px: this.cur.x, 
        py: this.cur.y, 

        duration: c.filterDuration, 
        delay: c.filterBetweenGap, 
        ease: d3.easeQuadInOut
      })
    }

    else {
      const delayHalf1 = this.prev.time * c.filterHalf1
      const durationStepHalf2 = c.filterHalf2/2

      const isLeaving = this.prev.active && !this.cur.active
      
      // Leaving Node
      if (isLeaving) {
        tl.to(this.render, {
          theta: this.prev.theta + Math.PI/8,
          rotation: rotationOffset(this.prev.theta + Math.PI/8),
          radius: this.prev.radius + 24,
          alpha: 0,

          duration: c.filterHalf1,
          delay: delayHalf1,
          ease: d3.easeQuadIn
        })
        .set(this.render, { renderable: false })
      }
      // Moving Node
      else {
        // Fade out and rotate back
        tl.to(this.render, {
          theta: this.prev.theta - Math.PI/24,
          rotation: rotationOffset(this.prev.theta - Math.PI/24),
          radius: this.prev.radius - 24,
          alpha: 0,

          duration: durationStepHalf2,
          delay: delayHalf1 + c.filterBetweenGap,
          ease: d3.easeQuadIn
        })

        // Fade in and rotate towards
        .set(this.render, { 
          theta: this.cur.theta - Math.PI/8,
          rotation: rotationOffset(this.cur.theta - Math.PI/8),
          radius: this.cur.radius - 24
        })
        .to(this.render, {
          theta: this.cur.theta,
          rotation: rotationOffset(this.cur.theta),
          radius: this.cur.radius,
          alpha: 1,
          
          duration: durationStepHalf2,
          ease: d3.easeQuadOut
        })
      }
    }

    return tl
  }

  public sort = (isBlock: boolean) => {
    const tl = this.makeTimeline("sort")

    if (isBlock) {
      tl.to(this.render, { 
        px: this.cur.x, 
        py: this.cur.y,

        ease: d3.easeQuadInOut,
        duration: c.filterHalf2,
        delay: this.prev.time * c.filterHalf1
      })
    }

    else {
      tl
      // Fade out and rotate anticlockwise
      .to(this.render, {
        theta: this.prev.theta - Math.PI/24,
        radius: this.prev.radius + 24,
        rotation: rotationOffset(this.prev.theta - Math.PI/24),
        alpha: 0,
        duration: .15,
        delay: this.cur.time,
        ease: d3.easeQuadInOut
      })

      // Fade in new position and rotate clockwise
      .set(this.render, {
        theta: this.cur.theta - Math.PI/24,
        rotation: rotationOffset(this.cur.theta - Math.PI/24),
        radius: this.cur.radius,
        alpha: 0,
        renderable: this.cur.active
      })
      .to(this.render, {
        theta: this.cur.theta,
        rotation: rotationOffset(this.cur.theta),
        alpha: 1,

        duration: c.filterHalf2,
        ease: d3.easeQuadInOut,
        delay: this.cur.time
      })
    }

    return tl
  }

  public selected = (isSelected: boolean) => {
    if (isSelected) {
      const tl = this.makeTimeline()
      
      tl
      .to(this.render, { alpha: 0, scale: this.scale()*2, duration: .3, ease: d3.easeQuadInOut })
      .set(this.render, { scale: this.scale()})
    }

  }

  public complexity = () => {
    const tl = this.makeTimeline()
    
    tl.to(this.render, {
      scale: this.scale(),
      delay: Math.random() * .7,
      duration: .3,
      ease: d3.easeQuadInOut
    })
  }
}