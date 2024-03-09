import * as PIXI from "pixi.js";
import * as d3 from "d3";
import { isEqual, cloneDeep } from "lodash";
import { gsap } from "gsap";
import { get } from "svelte/store";
import { nodes, selected } from "../stores/nodes"; 
import { complexityOn, figureHeight, figureWidth } from "../stores/canvas";
import { cameraOffset } from "../stores/zoom";
import c from "../config/layout"

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
  delay: number;
  config: any;
}

interface TweenCoordinates {
  x: number;
  y: number;
  radius: number;
  theta: number;
}


export class SimulationNode {
  public id: number;

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

  private tweenCoord: TweenCoordinates;

  // Idle Props
  private idlePropsTracker: IdleProperties[] = [];
  public idleProps: IdleProperties;
  public idlePropsPrev: IdleProperties;

  // Timelines
  public tlCoord: gsap.core.Timeline;
  public tlAttr: gsap.core.Timeline;
  
  // Selected
  private onSelectedState: boolean;
  private isSelected: boolean;

  constructor(id: number) {
    this.id = id

    this.tlCoord = gsap.timeline()
    this.tlAttr = gsap.timeline()
  }


  public log = (...args: any[]) => {
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

  public setPos = (getPos) => {
    this.log("setPos")

    const idleProps = getPos(this.getRef())
    const idlePropsPrev = this.idlePropsTracker[0]

    if (isEqual(idleProps, idlePropsPrev)) {
      return
    }

    const { x, y, theta, radius, config } = idleProps

    if (config.layout !== this.layout) {
      this.tweenCoord = { x, y, theta, radius }
    }

    this.layout = idleProps.config.layout

    this.idlePropsTracker.splice(0, 0, idleProps) // Add new pos to the head of the arr
    this.idlePropsTracker = this.idlePropsTracker.slice(0, 2) // Removes the arr tail

    this.idleProps = idleProps // Updates currentPos
    this.idlePropsPrev = this.idlePropsTracker[1] // Updates previousPos
  }

  public getScale = () => {
    return get(complexityOn) ? this.getRef().complexity : 1
  }

  public playState = (state: string) => {
    this.log("playState")

    if (!this.idleProps) {
      return this.log("\terror")
    }

    this.onSelectedState = state === 'selected'
    this.isSelected = this.onSelectedState && (<any>get(selected)).id === this.id

    if (this.onSelectedState) {
      this.playSelected()
    }
    else if (state === 'entrance') {
      this.playEntrance()
    } 
    else if (state === 'idle') {
      this.playIdle()
    }
    else if (state === 'exit') {
      this.playExit()
    } 
    else if (state === 'filter' && !this.hasActiveMatch()) {
      this.playFilter()
    }
    else if (state === 'move') {
      this.playMove()
    }
  }

  public playSelected = () => {
    this.log('selected')

    if (!this.isSelected) {
      return
    }

    const { tlAttr, attr } = this
    const scale = this.getScale()

    tlAttr
      .progress(1)
      .fromTo(attr,
        { 
          alpha: 1, 
          scale
        },
        { 
          alpha: 0, 
          scale: 2,

          duration: .3,
          ease: c.easeExit,
          onComplete: () => attr.scale = scale
        })
  }

  public playEntrance = () => {
    this.log('entrance')

    const { tlCoord, tlAttr, tweenCoord, attr, idleProps } = this
    const { delay } = idleProps

    tlAttr.progress(1)
    tlCoord.progress(1)
    
    attr.renderable = this.isActive()

    if (this.layout === 'block') {
      tweenCoord.x = idleProps.x
      tweenCoord.y = idleProps.y

      attr.alpha = 0
      attr.rotation = 0
      
      tlAttr.add(() => {
        attr.alpha = 1
      }, `+=${delay.toFixed(2)}`)

    }

    else if (this.layout === 'radial') {
      const duration = c.maxDurationRadial

      tlCoord.fromTo(tweenCoord,
        { 
          theta: <number>idleProps.theta - Math.PI/8,
          radius: idleProps.config.innerRadius,
        },
        { 
          theta: <number>idleProps.theta,
          radius: idleProps.radius,
          
          delay, 
          duration, 
          ease: c.easeEntrance 
        })

      tlAttr.fromTo(attr, 
        { alpha: 0 },
        { alpha: 1, delay, duration, ease: c.easeEntrance }
      )
    }
  }

  public playIdle = () => {
    this.log('idle')

    const { tlAttr, tlCoord, attr, tweenCoord, idleProps } = this

    tlCoord.progress(1)
    tlAttr.progress(1)

    attr.renderable = this.isActive()
    attr.alpha = 1

    if (this.layout === 'block') {
      tweenCoord.x = idleProps.x
      tweenCoord.y = idleProps.y
      tweenCoord.theta = 0
    } 
    else if (this.layout === 'radial') {
      tweenCoord.theta = idleProps.theta
    }

  }

  public playExit = () => {
    this.log('exit')
    
    const { tlCoord, tweenCoord, tlAttr, attr, idleProps } = this

    const delayFall = Math.random() * .5
    const delayFadeOut = Math.max(0, delayFall - Math.random()*.15)
    const duration = c.shifts - delayFall - (Math.random() * .3)

    const y = idleProps.y + get(figureHeight)*(Math.random()*.5 + .3)

    // Fall
    tlCoord
      .progress(1)
      .to(tweenCoord, { 
        y, 

        duration, 
        delay: delayFall, 
        ease: c.easeExit,
        onComplete: () => {
          tweenCoord.y -= y
        }
      })

    // Fade Out
    tlAttr
      .progress(1)
      .to(attr, { 
        alpha: 0, 

        duration, 
        delay: delayFadeOut, 
        ease: c.easeFade 
      })
  }

  public playFilter = () => {
    this.log('filter')
    
    const { tlCoord, tweenCoord, tlAttr, attr, idleProps, idlePropsPrev } = this
    
    const active = this.isActive()
    const isEntering = active

    const delay = isEntering
      ? idleProps.delay
      : idlePropsPrev.delay

    tlCoord.progress(1)
    tlAttr.progress(1)

    if (this.layout === 'block') {
      tlAttr.add(() => {
        attr.renderable = active
      }, `+=${delay.toFixed(2)}`)
    }

    else if (this.layout === 'radial') {

      tlAttr
        .add(() => {
          attr.renderable = active
        }, `+=${(isEntering ? delay : c.shifts).toFixed(2)}`)
        .fromTo(attr, 
          { alpha: +!active },
          { 
            alpha: +active, 
            
            delay, 
            duration: c.maxDurationRadial, 
            ease: c.easeExit 
          })
    

      if (isEntering) { // good
        tlCoord.fromTo(tweenCoord, 
          { theta: idleProps.theta - Math.PI/8 },
          { 
            theta: idleProps.theta, 
            
            delay, 
            duration: c.maxDurationRadial, 
            ease: c.easeExit 
          })
      } 
      else { // not good
        tlCoord.fromTo(tweenCoord, 
          { theta: idleProps.theta },
          { 
            theta: idlePropsPrev.theta + Math.PI/8, 

            duration: c.maxDurationRadial, 
            delay, 
            ease: c.easeExit 
          })
      }

    }
  }

  public playMove = () => {
    this.log('move')

    const { tlCoord, tlAttr, tweenCoord, idleProps } = this

    tlCoord.progress(1)
    tlAttr.progress(1)

    if (idleProps.delay > 1) {
      console.log(this)
    }

    if (this.layout === 'block') {
      const delay = idleProps.delay * .2

      tlCoord.to(tweenCoord, { 
        x: idleProps.x, 
        y: idleProps.y, 

        delay, 
        duration: c.shifts-delay, 
        ease: c.easeExit 
      })
    }
    else if (this.layout === 'radial') {
      tlCoord.to(tweenCoord, { 
        theta: idleProps.theta, 

        delay: idleProps.delay, 
        duration: c.maxDurationRadial, 
        ease: c.easeExit 
      })
    }
  }

  public playComplexity = () => {
    this.log('complexity')

    const { tlAttr, attr } = this

    tlAttr
      .progress(1)
      .to(attr, { 
        scale: this.getScale(), 

        delay: Math.random() * .7,
        duration: .3, 
        ease: c.easeExit 
      })
  }

  // public getCoordinates = () => {
  //   const { x, y, theta, radius } = this.tweenCoord

  //   return this.layout === "block"
  //     ? { x, y }
  //     : {
  //       x: (Math.cos(theta) * radius) + x,
  //       y: (Math.sin(theta) * radius) + y
  //     }
  // }

  public tick = () => {
    // Selected State & Selected Node
    if (this.onSelectedState && this.isSelected) {

    }
    // Selected State & Non-Selected Node
    else if (this.onSelectedState) {
      this.fx = undefined
      this.fy = undefined
      this.attr.x = this.x
      this.attr.y = this.y
    }
    // Other states
    else if (this.tweenCoord) {
      const { x, y, theta, radius } = this.tweenCoord

      if (this.layout === "block") {
        this.fx = this.attr.x = x
        this.fy = this.attr.y = y
      }
      else {
        this.fx = this.attr.x = Math.cos(theta) * radius + x
        this.fy = this.attr.y = Math.sin(theta) * radius + y
      }

    }
  }

}



export class DummySimulationNode extends SimulationNode {
  public r: number;

  public tl: gsap.core.Timeline;

  constructor() {
    super(-1)

    this.fx = 0;
    this.fy = 0;
    this.r = 0;

    this.tl = gsap.timeline().pause()
  }

  public isActive = () => {
    return true
  }

  public setPos = () => {
    return
  }

  public tick = () => {
    return
  }

  public playSwitchSelected = (stateSelectedOn: boolean) => {
    // This is supposed to be called only when 
    // the state selected is entered or exited
    // State changes from one state to another that is not selected should not trigger it.
    
    if (stateSelectedOn && !this.tl.isActive()) {
      this.tl
        .restart()
        .fromTo(this,
          { 
            fx: (<any>get(selected)).x, 
            fy: (<any>get(selected)).y 
          },
          { 
            fx: -get(cameraOffset).x, 
            fy: -get(cameraOffset).y, 
            duration: .300, 
            ease: d3.easeCubicOut
          })
        .fromTo(this,
          { r: 0 },
          { 
            r: Math.max(get(figureWidth), get(figureHeight)) * .4, 
            duration: .150, 
            ease: d3.easeCubicOut 
          }, '<=')
    }

    else if (!stateSelectedOn) {
      this.tl
        .clear()
        .add(() => {
          this.r = 0
        })
        .pause()
      
    }
  }

}