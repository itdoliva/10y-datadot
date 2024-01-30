<!-- 
  This component controls the movement and effects of each Node
 -->

<script>
  import { getContext, afterUpdate } from "svelte";
  import { tweened } from "svelte/motion";
  import { app, figureHeight } from "$lib/store/canvas";
  import { gsap } from "gsap";
  import * as d3 from "d3"
  import * as PIXI from "pixi.js"
  import Pokemon from './Pokemon.svelte';
  import { isEqual } from "lodash"
  import c from "$lib/config/layout"
  import clockwiseAngle from "$lib/utility/clockwiseAngle";

  export let id
  export let active
  export let pos
  export let node

  export let layout
  export let state
  export let config

  const { shiftms, shifts } = getContext("layout")
  const { scene } = getContext("viz")

  const posTracker = [ pos, undefined ]
  let prevPos = posTracker[1]

  // PIXI Hierarchy
  const outer = new PIXI.Container()
  outer.name = id
  scene.addChild(outer)

  const inner = new PIXI.Container()
  outer.addChild(inner)

  // Timeline
  const tlPos = gsap.timeline()
  const tlAlpha = gsap.timeline()
  const tlRenderable = gsap.timeline()

  // Variables
  const t = { 
    oX: 0, 
    oY: 0, 
    iX: 0,
    iY: 0,
    rotation: 0, 
    alpha: 1, 
    scale: 1,
    renderable: true
  }
  
  $app.ticker.add(() => {
    outer.x = t.oX
    outer.y = t.oY
    outer.rotation = t.rotation
    outer.renderable = t.renderable
    outer.alpha = t.alpha

    inner.x = t.iX
    inner.y = t.iY
  })

  $: {
    // Both layouts have the same exit
    if ( state === 'exit') {
      const delayFall = Math.random() * .5
      const delayFadeOut = Math.max(0, delayFall - Math.random()*.15)
      const duration = shifts - delayFall - (Math.random() * .3)

      // Fall
      const y = pos.fy + $figureHeight*(Math.random()*.5 + .3)
      tlPos.clear()
      tlPos.to(t, { oY: y, duration, delay: delayFall, ease: c.easeExit })

      // Fade Out
      tlAlpha.clear()
      tlAlpha.to(t, { alpha: 0, duration, delay: delayFadeOut, ease: c.easeFade })
    }

    else if (layout === 'block') {
      // At any state of the block layout, there is not origin rotation
      // and there's no inner container offset
      t.rotation = 0
      t.iX = 0
      t.iY = 0

      const delayEntrance = pos.data.delay

      if (state === 'idle') {
        // tlPos.clear()
        // tlAlpha.clear()
        // tlRenderable.clear()

        // t.oX = pos.fx
        // t.oY = pos.fy
        // t.renderable = active
        // t.alpha = 1
      }

      else if (state === 'entrance') {
        tlPos.clear()
        t.oX = pos.fx
        t.oY = pos.fy

        tlAlpha.clear()
        tlAlpha.add(() => t.alpha = 1, delayEntrance)
        tlAlpha.restart()
      }

      else if (state === 'filter' && active !== t.renderable) {
        const delay = active 
          ? delayEntrance // If prev <> cur & cur = true, it's entering
          : pos.data.getDelay(prevPos?.data, true) // If prev <> cur & cur = false, it's exiting

        tlRenderable.clear()
        tlRenderable.add(() => t.renderable = active, delay)
        tlRenderable.restart()
      }

      else if (state === 'move') {
        const delay = delayEntrance * .2

        tlPos.clear()
        tlPos.to(t, { oX: pos.fx, oY: pos.fy, delay, duration: shifts-delay, ease: c.easeExit })
      }

    }

    else if (layout === 'radial') {
      const { delay } = pos.data
      const duration = c.maxDurationRadial

      t.oX = 0
      t.oY = 0
      t.iX = pos.fx // fx = 0 on radial layout

      if (state === "idle") {
        // tlPos.clear()
        // tlAlpha.clear()
        // tlRenderable.clear()

        // t.rotation = pos.rotation
        // t.alpha = 1
        // t.iY = pos.fy

        // t.renderable = active
      }

      else if (state === "entrance") {
        tlPos.clear()
        tlPos.fromTo(t, 
          { rotation: pos.rotation - Math.PI/8, iY: config.innerRadius },
          { rotation: pos.rotation, iY: pos.fy, delay, duration, ease: c.easeExit }
        )

        tlAlpha.clear()
        tlAlpha.fromTo(t, 
          { alpha: 0 },
          { alpha: 1, delay, duration, ease: c.easeExit }
        )
      }

      else if (state === 'filter' && active !== t.renderable) {
        const filterDelay = active 
          ? delay // If prev <> cur & cur = true, it's entering
          : pos.data.getDelay(prevPos?.data) // If prev <> cur & cur = false, it's exiting

        tlRenderable.clear()
        tlRenderable.add(() => t.renderable = active, active ? filterDelay : c.shifts)
        tlRenderable.restart()

        tlAlpha.clear()
        tlAlpha.fromTo(t, 
          { alpha: +!active },
          { alpha: +active, delay: filterDelay, duration, ease: c.easeExit }
        )

        tlPos.clear()
        if (active) { // good
          tlPos.fromTo(t, 
            { rotation: pos.rotation - Math.PI/8, iY: config.innerRadius },
            { rotation: pos.rotation, iY: pos.fy, delay: filterDelay, duration, ease: c.easeExit }
          )
        } 
        else { // not good
          const rotation = prevPos.data.rotation + Math.PI/8
          const iY = config.innerRadius

          tlPos.to(t, { rotation, iY, duration, delay: filterDelay, ease: c.easeExit })
        }
      }

      else if (state === 'move') {
        tlPos.clear()
        tlPos.to(t, { rotation: clockwiseAngle(prevPos.rotation, pos.rotation), iY: pos.fy, duration, delay, ease: c.easeExit })
      }

    }
  }

  afterUpdate(() => {
    if (!isEqual(pos, posTracker[0])) {
      posTracker.splice(0, 0, pos) // Add new pos to the head of the arr
      posTracker.pop() // Removes the arr tail
      prevPos = posTracker[1] // Updates previousPos
    }
  })


</script>

<Pokemon parent={inner} {node}/>