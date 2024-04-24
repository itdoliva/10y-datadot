import * as PIXI from "pixi.js";
import * as d3 from "d3";
import { gsap } from "gsap";
import { isEqual, cloneDeep } from "lodash";
import { get } from "svelte/store";
import { nodeSize, nodes, selected } from "../stores/nodes"; 
import { complexityOn, figureHeight, figureWidth } from "../stores/canvas";
import { cameraOffsetX, cameraOffsetY } from "../stores/zoom";
import c from "../config/layout"
import Simulation from "./Simulation";

interface NodeRenderAttributes {
  x: number;
  y: number;
  rotation: number;
  alpha: number;
  scale: number;
  renderable: boolean;
}

interface IdleProperties {
  x: number;
  y: number;
  radius: number;
  theta: number;
  active: boolean;
  time: number;
}

interface TweenCoordinates {
  x: number;
  y: number;
  radius: number;
  theta: number;
}

interface AnimationControl {
  running: boolean;
  idleProps?: IdleProperties;
  next?: gsap.core.Timeline;
}


export class SimulationNode {
  public simulation: Simulation;
  public id: number;
  public clientId: number;
  public projectId: number;

  public layout: "block" | "radial";

  // Render Properties
  // Changes in these values determine how Pokemons will be displayed
  public attr: NodeRenderAttributes = {
    x: 0,
    y: 0,
    rotation: 0,
    alpha: 1,
    scale: 1,
    renderable: true,
  }

  // Simulation attributes
  public index: number;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public fx: number | undefined;
  public fy: number | undefined;

  // Hold the coordinate variables that transition in, out and between idleProps
  private tweenCoord: TweenCoordinates;

  // Animation
  private animation: AnimationControl;

  // Idle Props
  private idlePropsTracker: IdleProperties[];
  private idleProps: IdleProperties;
  private idlePropsPrev: IdleProperties;

  // Selected
  public onSelectedState: boolean;
  public isSelected: boolean;

  constructor(simulation: Simulation, id: number, clientId?: number, projectId?: number) {
    this.simulation = simulation

    this.id = id

    this.idlePropsTracker = []

    this.animation = { running: false }

    if (clientId) {
      this.clientId = clientId
    }

    if (projectId) {
      this.projectId = projectId
    }

  }


  public log = (...args: any[]) => {
    return
    return this.id === 0 ? console.log(...args) : undefined
  }

  public getRef = () => {
    return get(nodes).find(node => node.id === this.id)
  }

  public getIndex = () => {
    return this.getRef().i
  }

  public isActive = () => {
    return this.getRef().active
  }

  public hasActiveMatch = () => {
    return this.isActive() === this.attr.renderable
  }

  public setIdleProps = () => {
    // this.log("setIdleProps")

    const idlePropsNew = this.simulation.posData.find(d => d.id === this.id).pos
    idlePropsNew.x += this.simulation.layoutOffsetX
    idlePropsNew.y += this.simulation.layoutOffsetY
    
    // Check if new position is the same from the previous one
    // If so, do nothing

    const idlePropsCur = this.idlePropsTracker[0]

    idlePropsNew.active = this.isActive()

    if (isEqual(idlePropsNew, idlePropsCur)) {
      return
    }

    // If layout has changed
    if (!this.tweenCoord) {
      const newTweenCoord = { ...idlePropsNew }
      delete newTweenCoord.active
      this.tweenCoord = newTweenCoord
    }

    if (this.idlePropsTracker.length === 0) {
      this.idlePropsTracker.splice(0, 0, idlePropsNew, idlePropsNew)
    }
    else if (this.animation.running) {
      this.idlePropsTracker.splice(0, 0, idlePropsNew, <IdleProperties>this.animation.idleProps)
    }
    else {
      this.idlePropsTracker.splice(0, 0, idlePropsNew) // Add new pos to the head of the arr // this.simulation.inplaceIdleProps ? 1 : 
    }

    this.idlePropsTracker = this.idlePropsTracker.slice(0, 2) // Removes the arr tail

    this.idleProps = idlePropsNew // Updates currentPos
    this.idlePropsPrev = this.idlePropsTracker[1] // Updates previousPos

    this.log(this.idlePropsTracker)


    if (idlePropsNew.delay > 1) {
      console.warn(this.id, 'has high delay', idlePropsNew)
    }

    // this.log(this.idlePropsTracker)
  }

  public getScale = (complexityOn) => {
    return complexityOn ? this.getRef().complexity : 1
  }

  public toggleSelected = (selected) => {
    this.isSelected = selected.id === this.id

    const { attr, simulation, getScale } = this

    if (this.isSelected) {
      gsap.timeline({ overwrite: true })
      .to(attr, {
        alpha: 0,
        scale: 2,
        duration: .3,
        ease: d3.easeQuadInOut
      })
      .set(attr, { scale: getScale(get(complexityOn)) })
    }

    if (!simulation.onSelectedState) {
      
    }
  }


  public makeChainedTimeline = (overwrite: string | boolean = true): gsap.core.Timeline => {
    const isRunning = this.animation.running

    this.log("\tmakeChainedTimeline:", isRunning)

    const tl = gsap.timeline({ 
      overwrite,
      paused: isRunning,

      onStart: () => {
        this.animation.running = true
        this.animation.idleProps = this.idleProps

        this.log("\tonStart:", isRunning)
      },

      onComplete: () => {
        this.animation.running = false
        this.animation.idleProps = undefined
        this.animation.next?.play()

        tl.kill()

        this.log("\tonComplete:", isRunning)
      }
    })

    if (isRunning) {
      this.animation.next = tl
    }

    return tl
  }

  public chainEntrance = () => {
    const { simulation, attr, tweenCoord, idleProps } = this
    const { x, y, theta, radius, time } = idleProps
    const delay = time

    const active = this.isActive()

    const tl = gsap.timeline({ overwrite: true })

    if (simulation.command.layout === "block") {
      tl
      .set(tweenCoord, { x, y, radius, theta })
      .set(attr, { alpha: 0, rotation: 0, renderable: active })
      .set(attr, { alpha: 1 }, delay.toFixed(2))
    }

    else {
      const duration = c.maxDurationRadial
      const ease = c.easeEntrance

      tl
      .set(tweenCoord, { x: 0, y: 0, radius: radius - 24, theta: theta - Math.PI/8 })
      .set(attr, { alpha: 0, rotation: theta + Math.PI, renderable: active })
      .to(tweenCoord, { radius, theta, delay, duration, ease })
      .to(attr, { alpha: 1, rotation: theta + Math.PI, duration, ease }, "<")
    }

    tl.eventCallback("onComplete", () => {
      tl.kill()
    })

    return tl
  }

  public chainExit = () => {
    const { attr, tweenCoord, idleProps } = this

    const delayFall = Math.random() * .5
    const delayFadeOut = Math.max(0, delayFall - Math.random()*.15)
    const duration = c.shifts - delayFall - (Math.random() * .3)

    const y = idleProps.y + get(figureHeight)*(Math.random()*.5 + .3)

    const tl = gsap.timeline({ overwrite: true })

    tl.to(attr, { alpha: 0, duration, delay: delayFadeOut, ease: c.easeFade })
    tl.to(tweenCoord, { y, duration, delay: delayFall - delayFadeOut, ease: c.easeExit }, "<")

    tl.eventCallback("onComplete", () => {
      tl.kill()
    })

    return tl
  }

  public chainFilterOut = () => {
    // Filter Out -> Move Remaining
    const { simulation, tweenCoord, attr, idleProps, idlePropsPrev } = this

    const { x, y, theta, radius, time } = idleProps

    const tl = this.makeChainedTimeline()

    // BLOCK
    if (simulation.command.layout === "block") {
      tl
      .set(attr, { 
        renderable: idleProps.active,
        delay: idlePropsPrev.time * c.filterDuration
      })
      .to(tweenCoord, { 
        x, 
        y, 
        duration: c.filterDuration, 
        delay: c.filterBetweenGap, 
        ease: d3.easeQuadInOut
      }, "<")
    }

    // RADIAL
    else {
      const delayHalf1 = idlePropsPrev.time * c.filterHalf1
      const durationStepHalf2 = c.filterHalf2/2

      // Filtered out
      if (idlePropsPrev.active && !idleProps.active) {

        tl
        .to(tweenCoord, { 
          theta: idlePropsPrev.theta + Math.PI/8, 
          radius: idlePropsPrev.radius + 24, 

          duration: c.filterHalf1, 
          delay: delayHalf1,
          ease: d3.easeQuadIn
        })
        .to(attr, { 
          alpha: 0, 

          duration: c.filterHalf1,
          ease: d3.easeCubicIn
        }, "<")
        .set(attr, { renderable: false })
      }

      // Moved
      else {
        tl
        // Fade out and rotate back
        .to(attr, { 
          alpha: 0, 
          duration: durationStepHalf2, 
          delay: delayHalf1 + c.filterBetweenGap , 
          ease: d3.easeCubicIn
        })
        .to(tweenCoord, { 
          theta: idlePropsPrev.theta - Math.PI/24, 
          radius: idlePropsPrev.radius - 24, 
          duration: durationStepHalf2, 
          ease: d3.easeQuadIn
        }, "<")

        // Fade in new position while rotating on
        .set(tweenCoord, { 
          theta: theta - Math.PI/8, 
          radius: radius - 24
        })
        .to(tweenCoord, { theta,
           radius, 
           duration: durationStepHalf2,
           ease: d3.easeQuadOut
        })
        .to(attr, { 
          alpha: 1, 
          duration: durationStepHalf2 ,
          ease: d3.easeCubicOut
        }, "<")
      }
    }


    return tl
  }

  public chainFilterIn = () => {
    // Move Existing -> Filter In
    const { simulation, tweenCoord, attr, idleProps, idlePropsPrev } = this

    const { x, y, theta, radius, active, time } = idleProps

    const tl = this.makeChainedTimeline("auto")

    const ease = d3.easeQuadInOut

    // BLOCK
    if (simulation.command.layout === "block") {

      // Move Existing
      if (idlePropsPrev.active && active) {

        tl.to(tweenCoord, { 
          x, 
          y, 
          ease, 
          duration: c.filterHalf2,
          delay: idlePropsPrev.time * c.filterHalf1
        })

      }

      // Waterfall In
      else {
        tl
        .set(tweenCoord, { 
          x, 
          y 
        })
        .set(attr, { 
          renderable: active, 
          delay: (time * c.filterDuration) + c.filterHalf1 + c.filterBetweenGap 
        })
      }
    }

    // RADIAL
    else {

      tl
      // Fade out and rotate back
      .to(attr, { 
        alpha: 0, 

        duration: .15, 
        delay: ease(time) * c.filterHalf1 
      })
      .to(tweenCoord, { 
        theta: idlePropsPrev.theta - Math.PI/24, 
        radius: idlePropsPrev.radius + 24, 
        
        duration: .15, 
        ease 
      }, "<")
      
      // Fade in new position while rotating on
      .set(tweenCoord, { 
        theta: theta - Math.PI/24, 
        radius: radius 
      })
      .set(attr, { 
        alpha: 0, 
        renderable: active, 
        rotation: theta,
        delay: .03 
      })
      .to(tweenCoord, { 
        theta, 
        duration: .15, 
        ease, 
        delay: ease(time) * c.filterHalf2,
      })
      .to(attr, { 
        alpha: 1, 
        duration: .15 
      }, "<")


    }

    return tl
  }

  public chainSort = () => {
    // Move Existing -> Filter In
    const { simulation, tweenCoord, attr, idleProps, idlePropsPrev } = this

    this.log(idleProps, idlePropsPrev)

    const { x, y, theta, radius, active, time } = idleProps

    const tl = this.makeChainedTimeline()

    const ease = d3.easeQuadInOut

    // BLOCK
    if (simulation.command.layout === "block") {

      tl.to(tweenCoord, { 
        x, 
        y, 
        ease, 
        duration: c.filterHalf2,
        delay: idlePropsPrev.time * c.filterHalf1
      })

    }

    // RADIAL
    else {
      const duration = c.filterHalf2 

      tl
      // Fade out and rotate back
      .to(attr, { 
        alpha: 0, 
        duration: .15, 
        delay: time 
      })
      .to(tweenCoord, { 
        theta: idlePropsPrev.theta - Math.PI/24, 
        radius: idlePropsPrev.radius + 24, 
        duration: .15, 
        ease 
      }, "<")
      
      // Fade in new position while rotating on
      .set(attr, { 
        alpha: 0, 
        rotation: theta + Math.PI, 
        renderable: active 
      })
      .set(tweenCoord, { 
        theta: theta - Math.PI/24, 
        radius: radius 
      })
      .to(tweenCoord, { 
        theta, 
        duration, 
        ease, 
        delay: time 
      })
      .to(attr, { 
        alpha: 1, 
        duration
      }, "<")

    }

    return tl
  }

  public playComplexity = (complexityOn: boolean) => {
    this.log('complexity')

    const { attr, getScale } = this

    const scale = getScale(complexityOn)

    gsap.timeline({ overwrite: "auto" })
    .to(attr, {
      scale,
      delay: Math.random() * .7,
      duration: .3,
      ease: d3.easeQuadInOut
    })
  }

  public tick = () => {
    // Selected State & Selected Node
    if (this.simulation.onSelectedState && this.isSelected) {

    }
    // Selected State & Non-Selected Node
    else if (this.simulation.onSelectedState && !this.isSelected) {
      this.fx = undefined
      this.fy = undefined
      this.attr.x = this.tweenCoord.x = this.x
      this.attr.y = this.tweenCoord.y = this.y
    }
    // Other states
    else if (this.tweenCoord) {
      const { x, y, theta, radius } = this.tweenCoord

      if (this.simulation.command.layout === "block") {
        this.fx = this.attr.x = x
        this.fy = this.attr.y = y
      }
      else {
        this.fx = this.attr.x = Math.cos(theta) * radius + x
        this.fy = this.attr.y = Math.sin(theta) * radius + y
      }
    }
  }

  public getRadius = (): number => {
    return this.isActive()
      ? get(nodeSize)
      : 0
  }

}



export class DummySimulationNode extends SimulationNode {
  public r: number;

  constructor(simulation: Simulation) {
    super(simulation, -1)

    this.fx = 0;
    this.fy = 0;
    this.r = 0;
  }

  public isActive = () => {
    return true
  }

  public getRadius = () => {
    return this.r
  }

  public setIdleProps = () => {
    return
  }

  public tick = () => {
    return
  }

  public toggleSelected = (selected) => {
    const { onSelectedState, updateForceCollideRadius } = this.simulation

    const tl = gsap.timeline({ 
      overwrite: "auto",
      onUpdate: updateForceCollideRadius
    })


    if (onSelectedState) {
      const targetX = -get(cameraOffsetX)
      const targetY = -get(cameraOffsetY)
      const targetR = Math.max(get(figureWidth), get(figureHeight)) * .4
      
      tl
      .fromTo(this, 
        { 
          fx: selected.x,
          fy: selected.y,
        },
        {
          fx: targetX,
          fy: targetY,

          duration: .3,
          ease: d3.easeQuadInOut
        }
      )
      .fromTo(this,
        { r: 0 },
        {
          r: targetR,
          duration: .15,
          ease: d3.easeCubicInOut
        }, "<")

    }

    else {
      tl.set(this, { r: 0 })
    }
  }

}