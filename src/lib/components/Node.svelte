<!-- 
  This component controls the movement and effects of each Node
 -->

<script>
  import { getContext, afterUpdate } from "svelte";
  import { app, figureHeight, complexityOn } from "$lib/stores/canvas";
  import { selected } from "$lib/stores/nodes";
  import { gsap } from "gsap";
  import * as d3 from "d3"
  import * as PIXI from "pixi.js"
  import Pokemon from './Pokemon.svelte';
  import { isEqual } from "lodash"
  import c from "$lib/config/layout"
  import clockwiseAngle from "$lib/utility/clockwiseAngle";
  import { Point, compressSpaces } from "canvg";
  

  const shouldLog = true
  const log = (toLog) => (shouldLog && id === 0) ? console.log(toLog) : undefined


  export let id
  export let simulationNode
  export let pos

  export let layout
  export let state
  export let config


  const { scene } = getContext("viz")

  // Keeps track of the current and previous position parameters
  const posTracker = [ pos, undefined ]
  let prevPos = posTracker[1]

  // PIXI Hierarchy
  const container = new PIXI.Container()
  
  container.name = id

  scene.addChild(container)

  container.eventMode = 'static'

  container.accessible = true
  container.cursor = 'pointer';

  container.onpointerup = (e) => {
    const { t } = simulationNode

    selected.set({
      active: true,
      id,
      x: t.x,
      y: t.y
    })
  }

  // Timeline
  const tlPos = gsap.timeline()
  const tlAlpha = gsap.timeline()
  const tlRenderable = gsap.timeline()
  const tlScale = gsap.timeline()

  const point = new PIXI.Graphics()
  if (id === 0) {
    scene.addChild(point)
  }

  // Variables
  $app.ticker.add(() => {

    const { t } = simulationNode

    container.x = t.x
    container.y = t.y
    
    container.pivot.set(t.pivotX, t.pivotY)
    container.rotation = t.rotation

    container.renderable = t.renderable
    container.alpha = t.alpha

    container.scale.set(t.scale)

    // if (id === 0) {
    //   const globalPos = inner.toGlobal(scene.centerPoint)

    //   point.x = -globalPos.x
    //   point.y = -globalPos.y

    //   point.clear()
    //   point.beginFill(0xcc0000)
    //   point.drawCircle(0, 0, 5)
    //   point.endFill()


    //   point.beginFill(0xccff00)
    //   point.drawCircle(0, 0, 50)
    //   point.endFill()
    // }

  })


  // On turn complexity on or off
  $: playComplexity($complexityOn)

  // On state change
  $: if (state === 'selected') {
    playSelected()
  }
  else if (state === 'idle') {
    playIdle()
  }
  else if (state === 'exit') {
    playExit()
  } 
  else if (state === 'entrance') {
    playEntrance()
  } 
  else if (state === 'filter' && !simulationNode.hasActiveMatch()) {
    playFilter()
  }
  else if (state === 'move') {
    playMove()
  }


  afterUpdate(() => {
    if (!isEqual(pos, posTracker[0])) {
      posTracker.splice(0, 0, pos) // Add new pos to the head of the arr
      posTracker.pop() // Removes the arr tail
      prevPos = posTracker[1] // Updates previousPos
    }
  })


  function playSelected() {
    log('selected (id: 0)')

    const isSelected = $selected.id === id

    if (isSelected) {
      const { t } = simulationNode

      tlAlpha.clear()
      tlAlpha.fromTo(t,
        { alpha: 1 },
        { alpha: 0, duration: .3, ease: c.easeExit }
      )

      tlScale.clear()
      tlScale.fromTo(t,
        { scale: getScale($complexityOn) },
        { scale: 2, duration: .3, ease: c.easeExit }
      )
      tlScale.add(() => {
        t.scale = getScale($complexityOn)
      })
    }


  }


  function playIdle() {
    log('idle (id: 0)')

    tlPos.clear()
    tlAlpha.clear()

    const { t, isActive } = simulationNode

    t.renderable = isActive()

    if (layout === 'block') {
      t.x = pos.fx
      t.y = pos.fy
      t.alpha = 1
      t.rotation = 0
      t.pivotY = 0
    } 
    else if (layout === 'radial') {
      t.x = 0
      t.y = 0
      t.alpha = 1
      t.rotation = pos.rotation
      t.pivotY = pos.fy
    }
  }


  function playExit() {
    log('exit (id: 0)')
    
    const { t } = simulationNode

    const delayFall = Math.random() * .5
    const delayFadeOut = Math.max(0, delayFall - Math.random()*.15)
    const duration = c.shifts - delayFall - (Math.random() * .3)

    // Fall
    const y = pos.fy + $figureHeight*(Math.random()*.5 + .3)
    tlPos.clear()
    tlPos.to(t, { y, duration, delay: delayFall, ease: c.easeExit })

    // Fade Out
    tlAlpha.clear()
    tlAlpha.to(t, { alpha: 0, duration, delay: delayFadeOut, ease: c.easeFade })
  }


  function playEntrance() {
    log('entrance (id: 0)')

    const { t, isActive } = simulationNode

    const { delay } = pos.data

    tlAlpha.clear()
    tlRenderable.clear()
    
    t.renderable = isActive()

    if (layout === 'block') {
      t.rotation = 0
      t.pivotY = 0
      t.alpha = 0

      t.x = pos.fx
      t.y = pos.fy
      
      tlAlpha.add(() => t.alpha = 1, `+=${delay.toFixed(2)}`)
    }

    else if (layout === 'radial') {
      const duration = c.maxDurationRadial
      const startRotation = pos.rotation - Math.PI/8

      t.x = 0
      t.y = 0

      tlPos.clear()
      tlPos.fromTo(t,
        { rotation: startRotation, pivotY: config.innerRadius },
        { rotation: pos.rotation, pivotY: pos.fy, delay, duration, ease: c.easeExit }
      )

      tlAlpha.fromTo(t, 
        { alpha: 0 },
        { alpha: 1, delay, duration, ease: c.easeExit }
      )
    }
  }


  function playFilter() {
    log('filter (id: 0)')

    const { t, isActive } = simulationNode
    const active = isActive()

    const delay = active || !prevPos
      ? pos.data.delay // If cur = true, it's entering
      : pos.data.getDelay(prevPos.data, true) // If cur = false, it's exiting

    tlRenderable.clear()

    if (layout === 'block') {

      tlRenderable.add(() => {
        t.renderable = active
      }, `+=${delay.toFixed(2)}`)

    }

    else if (layout === 'radial') {
      tlRenderable.add(() => {
        t.renderable = active
      }, `+=${(active ? delay : c.shifts).toFixed(2)}`)

      tlAlpha.clear()
      tlAlpha.fromTo(t, 
        { alpha: +!active },
        { alpha: +active, delay, duration: c.maxDurationRadial, ease: c.easeExit }
      )

      tlPos.clear()
      if (active) { // good
        tlPos.fromTo(t, 
          { rotation: pos.rotation - Math.PI/8, pivotY: config.innerRadius },
          { rotation: pos.rotation, pivotY: pos.fy, delay, duration: c.maxDurationRadial, ease: c.easeExit }
        )
      } 
      else { // not good
        const rotation = prevPos.data.rotation + Math.PI/8
        const pivotY = config.innerRadius

        tlPos.to(t, { rotation, pivotY, duration: c.maxDurationRadial, delay, ease: c.easeExit })
      }
    }
  }


  function playMove() {
    log('move (id: 0)')

    const { t } = simulationNode

    tlPos.clear()

    if (layout === 'block') {
      const delay = pos.data.delay * .2

      tlPos.to(t, { 
        x: pos.fx, 
        y: pos.fy, 
        delay, 
        duration: c.shifts-delay, 
        ease: c.easeExit 
      })
    }
    else if (layout === 'radial') {
      tlPos.to(t, { 
        rotation: clockwiseAngle(prevPos.rotation, pos.rotation), 
        pivotY: pos.fy, 
        delay: pos.data.delay, 
        duration: c.maxDurationRadial, 
        ease: c.easeExit 
      })
    }
  }

  function playComplexity(complexityOn) {
    const { t } = simulationNode

    tlScale.clear()

    tlScale.to(t, { 
      scale: getScale(complexityOn), 
      delay: Math.random() * .7,
      duration: .3, 
      ease: c.easeExit 
    })
  }

  function getScale(complexityOn) {
    return complexityOn
      ? simulationNode.getRef().complexity
      : 1
  }


</script>


<Pokemon parent={container} id={id}/>