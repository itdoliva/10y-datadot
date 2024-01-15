<script>
  import { getContext } from "svelte";
  import { tweened } from "svelte/motion";
  import { figureHeight, hovered } from "$lib/store/canvas";
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

  const { stage, addTickerCallback } = getContext("pixi")

  const origin = new PIXI.Container()
  origin.name = node.id
  stage.addChild(origin)

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

  addTickerCallback(() => {
    origin.x = $originX
    origin.y = $originY
    origin.rotation = $originRotation
    // origin.renderable = $originRenderable
    origin.alpha = $originAlpha
    origin.scale.set($originScale)

    container.x = $containerX
    container.y = $containerY
  })

  $: {
    prevPos = pos
    pos = $getPos(node)
  }

  $: {
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
      // const entranceDelay = pos.data.getDelay(pos.data) * 1000 
      // const exitDelay = pos.data.getDelay(prevPos?.data, true) * 1000
      const entranceDelay = pos.data.delay * 1000 
      const exitDelay = prevPos ? prevPos.data.delay * 1000 : 0
      if (node.id === 0) console.log(`
        ${$state};\n
        cur: ${pos.data.row}, ${pos.data.column}\n
        prv: ${prevPos?.data.row}, ${prevPos?.data.column}\n
        -> ${entranceDelay}, ${pos.data.getDelay(pos.data) * 1000}\n
        <- ${exitDelay}, ${pos.data.getDelay(prevPos?.data, true) * 1000}
      `)

      if (node.active !== $originRenderable) {
        const delay = node.active 
          ? entranceDelay // If prev <> cur & cur = true, it's entering
          : exitDelay // If prev <> cur & cur = false, it's exiting

        // if (delay > 1000) {
        //   console.log({ 
        //     id: node.id, 
        //     y: node.active ? pos.fy : prevPos.fy,
        //     delay, 
        //     type: node.active ? 'entrance' : 'exit'
        //   })
        // }

        originRenderable.set(node.active, { delay })
        originScale.set(node.active ? 1 : .2, { delay })
      }

      if ($state === 'idle' || $state === 'entrance') {
        originAlpha.set(1, { delay: entranceDelay })
        originX.set(pos.fx)
        originY.set(pos.fy)
      }
      else if ($state === 'filter') {
        originAlpha.set(1, { delay: exitDelay })
      }
      else if ($state === 'move' && $filter === 'exclusion') {
        const moveOptions = {
          duration: shiftms,
          interpolate: d3.interpolateNumber,
          easing: d3.easeSinIn
        }

        originX.set(pos.fx, moveOptions)
        originY.set(pos.fy, moveOptions)
      }

    }

    else if ($layout === 'radial') {
      const { radians } = pos.data
      const rotation = radians - Math.PI/2

      const delayScale = d3.scaleLinear()
        .domain([-Math.PI/2, 2*Math.PI-Math.PI/2])
        .range([0, 700])

      originX.set(0)
      originY.set(0)
      containerX.set(pos.fx)

      if ($state === "entrance") {
        originRotation.set(rotation - Math.PI/8)
        originAlpha.set(0)

        const options = {
          delay: delayScale(rotation),
          duration: 300,
          interpolate: d3.interpolateNumber,
          easing: d3.easeCubicInOut
        }

        originRotation.set(rotation, options)
        originAlpha.set(1, options)

        containerY.set($config.innerRadius)
        containerY.set(pos.fy, { ...options, delay: Math.max(0, options.delay-100), duration: 500})
      }

      else if ($state === "idle") {
        originRotation.set(rotation)
      }

    }
  }


</script>

<Pokemon parent={container} {node}/>