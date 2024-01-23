<script>
  import { getContext } from "svelte";
  import { tweened } from "svelte/motion";
  import { app, figureHeight } from "$lib/store/canvas";
  import { nodes } from "$lib/store/nodes";
  import * as d3 from "d3"
  import * as PIXI from "pixi.js"
  import Pokemon from './Pokemon.svelte';

  export let node 

  const { 
    layout, 
    state, 
    filter,
    getPos,
    config, 
    shiftms
  } = getContext("layout")

  const { scene } = getContext("viz")

  const origin = new PIXI.Container()
  origin.name = node.id
  scene.addChild(origin)

  const container = new PIXI.Container()
  origin.addChild(container)

  const interpolateConstant = (a, b) => () => b
  const defaultOptions = { duration: 1, interpolate: interpolateConstant }

  const originAlpha = tweened(1, defaultOptions)
  const originScale = tweened(1, defaultOptions)
  const originX = tweened(0, defaultOptions)
  const originY = tweened(0, defaultOptions)
  const originRotation = tweened(0, defaultOptions)
  const originRenderable = tweened(true, { interpolate: interpolateConstant })

  const containerX = tweened(0, defaultOptions)
  const containerY = tweened(0, defaultOptions)
  
  let prevPos
  let pos

  $app.ticker.add(() => {
    origin.x = $originX
    origin.y = $originY
    origin.rotation = $originRotation
    origin.renderable = $originRenderable
    origin.alpha = $originAlpha

    container.x = $containerX
    container.y = $containerY
  })

  $: {
    prevPos = pos
    pos = $getPos(node)
  }

  $: {
    if (node.counter === $nodes.counter) {
      // Both layouts have the same exit
      if ( $state === 'exit') {
        const fallDelay = Math.random() * .5 * 1000
        const fadeoutDelay = Math.max(0, fallDelay - Math.random()*150)
  
        const y = pos.fy + $figureHeight*(Math.random()*.5 + .3)
  
        const duration = shiftms - fallDelay - (Math.random() * 300)
  
        const options = { duration, interpolate: d3.interpolateNumber }
  
        // Fall
        originY.set(y, { ...options, delay: fallDelay, easing: d3.easeSinIn }) 
  
        // Fade Out
        originAlpha.set(0, { ...options, delay: fadeoutDelay }) 
      }
  
      else if ($layout === 'block') {
        // At any state of the block layout, there is not origin rotation
        // and the container does not 
        originRotation.set(0)
        containerX.set(0)
        containerY.set(0)

        const entranceDelay = pos.data.delay

        if ($state === 'idle' || $state === 'entrance') {
          originAlpha.set(1, { delay: entranceDelay })
          originX.set(pos.fx)
          originY.set(pos.fy)
        }

        else if ($state === 'filter' && node.active !== $originRenderable) {
          const delay = node.active 
            ? entranceDelay // If prev <> cur & cur = true, it's entering
            : pos.data.getDelay(prevPos?.data, true) // If prev <> cur & cur = false, it's exiting
  
          originRenderable.set(node.active, { delay }) // originScale.set(node.active ? 1 : .2, { delay })
        }

        else if ($state === 'move') {
          const delay = entranceDelay * .2
          const moveOptions = {
            delay,
            duration: shiftms - delay,
            interpolate: d3.interpolateNumber,
            easing: d3.easeSinIn
          }
  
          originX.set(pos.fx, moveOptions)
          originY.set(pos.fy, moveOptions)
        }
  
      }
  
      else if ($layout === 'radial') {
        const { delay } = pos.data
        const duration = 300

        originX.set(0)
        originY.set(0)
        containerX.set(pos.fx)

        const options = {
            delay,
            duration,
            interpolate: d3.interpolateNumber,
            easing: d3.easeCubicInOut
          }
  
        if ($state === "idle") {
          originRotation.set(pos.rotation)
          originAlpha.set(1)
          containerY.set(pos.fy)
        }

        else if ($state === "entrance") {
          originRotation.set(pos.rotation - Math.PI/8)
          containerY.set($config.innerRadius)
          originAlpha.set(0)
          
          originRotation.set(pos.rotation, options)
          containerY.set(pos.fy, { ...options, delay: Math.max(0, delay-100), duration: 500})
          originAlpha.set(1, options)
        }

        else if ($state === 'filter' && node.active !== $originRenderable) {
          const filterDelay = node.active 
            ? delay // If prev <> cur & cur = true, it's entering
            : pos.data.getDelay(prevPos?.data) // If prev <> cur & cur = false, it's exiting
  
            originRenderable.set(node.active, { delay: filterDelay + duration })
            originAlpha.set(+node.active, { ...options, delay: filterDelay })

            if (!node.active) {
              originRotation.set(prevPos.data.rotation + Math.PI/8, { ...options, delay: filterDelay})
              containerY.set($config.innerRadius, { ...options, delay: Math.max(0, filterDelay-100), duration: 500})
            }
        }

        else if ($state === 'move') {
          originRotation.set(pos.rotation, { ...options, duration: shiftms-delay })
          containerY.set(pos.fy, { ...options, delay: Math.max(0, delay-100), duration: 500 })
        }
  
      }
    }
  }


</script>

<Pokemon parent={container} {node}/>