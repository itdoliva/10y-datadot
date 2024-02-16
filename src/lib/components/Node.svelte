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
  

  const shouldLog = false
  const log = (toLog) => (shouldLog && id === 0) ? console.log(toLog) : undefined


  export let id
  export let i
  export let active
  
  export let pos

  export let layout
  export let state
  export let config

  export let year = undefined
  export let channel = undefined
  export let designs = undefined
  export let goals = undefined
  export let industry = undefined
  export let products = undefined
  export let clientId = undefined
  export let complexity = undefined
  export let ids = undefined

  const info = { 
    i,
    year, 
    channel, 
    designs, 
    goals, 
    industry, 
    products, 
    clientId,
    complexity,
    ids
  }







  const { scene } = getContext("viz")

  // Keeps track of the current and previous position parameters
  const posTracker = [ pos, undefined ]
  let prevPos = posTracker[1]

  // PIXI Hierarchy
  const container = new PIXI.Container()
  const inner = new PIXI.Container()
  
  container.name = id
  container.addChild(inner)

  scene.addChild(container)

  container.eventMode = 'static'

  container.accessible = true
  container.cursor = 'pointer';
  container.onpointerdown = () => {
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

  // Variables
  const t = { 
    x: 0, 
    y: 0, 
    rotation: 0, 
    alpha: 1, 
    scale: 1,
    renderable: true,
    pivotX: 0,
    pivotY: 0,
  }
  

  $app.ticker.add(() => {
    container.x = state === "selected" ? pos.fx : t.x
    container.y = state === "selected" ? pos.fy : t.y
    container.rotation = t.rotation
    container.renderable = t.renderable
    container.alpha = t.alpha
    container.pivot.set(t.pivotX, t.pivotY)

    inner.scale.set(t.scale, t.scale)
  })


  // On turn complexity on or off
  $: {
      tlScale.clear()
      tlScale.to(t, { 
        scale: $complexityOn ? node.complexity : 1, 
        delay: Math.random() * .7,
        duration: .3, 
        ease: c.easeExit }
      )
  }

  $: log({ id, active, pos }) // layout, state, config are correctly changing


  // On state change
  $: if (state === 'selected') {
    playSelected()
  }
  else if (state === 'idle') {
    // playIdle()
  }
  else if (state === 'exit') {
    playExit()
  } 
  else if (state === 'entrance') {
    playEntrance()
  } 
  else if (state === 'filter' && active !== t.renderable) {
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

    t.x = pos.fx
    t.y = pos.fy

    // tlPos.clear()
    // tlPos.add(() => {
    //   t.x = pos.data.getX()
    //   t.y = pos.data.getY()
    // }, `+=${c.shifts}`)
  }

  function playIdle() {
    log('idle (id: 0)')

    tlPos.clear()
    tlAlpha.clear()
    tlRenderable.clear()
    tlScale.clear()

    t.renderable = active

    if (layout === 'block') {
      t.x = pos.fx
      t.y = pos.fy
      t.alpha = 1
      // t.rotation = 0
      t.pivotY = 0
      t.scale = 1
    } 
    else if (layout === 'radial') {
      // t.x = 0
      // t.y = 0
      // t.alpha = 1
      // t.rotation = pos.rotation
      // t.pivotY = pos.fy
      // t.scale = 1
    }
  }


  function playExit() {
    log('exit (id: 0)')
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
    const { delay } = pos.data

    tlPos.clear()
    tlAlpha.clear()
    tlRenderable.clear()
    
    t.renderable = active

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

    const delay = active 
      ? pos.data.delay // If cur = true, it's entering
      : pos.data.getDelay(prevPos?.data, true) // If cur = false, it's exiting

    tlRenderable.clear()

    if (layout === 'block') {
      tlRenderable.add(() => t.renderable = active, `+=${delay.toFixed(2)}`)
    }
    else if (layout === 'radial') {
      tlRenderable.add(() => t.renderable = active, `+=${(active ? delay : c.shifts).toFixed(2)}`)

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


</script>


<Pokemon parent={container} node={info}/>