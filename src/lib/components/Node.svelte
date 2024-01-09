<script>
  import { getContext } from "svelte";
  import { tweened } from "svelte/motion";
  import { figureHeight } from "$lib/store/canvas";
  import * as d3 from "d3"
  import * as PIXI from "pixi.js"
  import Pokemon from './Pokemon.svelte';

  export let node 

  const { 
    layout, 
    state, 
    getPos,
    config, 
    shiftms,
    blockParams
  } = getContext("layout")

  const { stage, addTickerCallback } = getContext("pixi")

  const origin = new PIXI.Container()
  origin.name = "Node " + node.id
  stage.addChild(origin)

  const container = new PIXI.Container()
  origin.addChild(container)

  const interpolateConstant = (a, b) => () => b
  const defaultOptions = { duration: 1, interpolate: interpolateConstant }

  const originAlpha = tweened(1, defaultOptions)
  const originX = tweened(0, defaultOptions)
  const originY = tweened(0, defaultOptions)
  const originRotation = tweened(0, defaultOptions)
  const originRenderable = tweened(true, { interpolate: interpolateConstant })

  const containerX = tweened(0, defaultOptions)
  const containerY = tweened(0, defaultOptions)
  
  let fx
  let fy
  let frotation
  let data



  addTickerCallback(() => {
    origin.x = $originX
    origin.y = $originY
    origin.rotation = $originRotation
    origin.alpha = $originAlpha
    origin.renderable = $originRenderable

    container.x = $containerX
    container.y = $containerY
  })
  
  $: setFinalPos($getPos)
  $: getCurrentPos($layout, $state, $config)


  function setFinalPos(getPos) {
    const pos = getPos(node)
    fx = pos.fx
    fy = pos.fy
    frotation = pos.rotation
    data = pos.data
  }


  function getCurrentPos(layout, state, config) {
    
    if ( state === 'exit') {
      const exitAt = Math.random() * .5 * 1000

      const duration = shiftms - exitAt - (Math.random() * 300)

      const options = {
        delay: exitAt,
        duration,
        interpolate: d3.interpolateNumber
      }

      originY.set(fy + $figureHeight*(.3 + Math.random()*.5), { ...options, easing: d3.easeSinIn })
      originAlpha.set(0, { ...options, delay: exitAt-Math.random()*150 })
    }

    else if (layout === 'block') {
      const delay = data.entryAt*1000

      originRotation.set(0)

      containerX.set(0)
      containerY.set(0)

      
      if (state === 'filterA') {
        originRenderable.set(node.active, { delay })
      }
      else if (state === 'filterB') {
        originX.set(fx, { duration: 1000, interpolate: d3.interpolateNumber, easing: d3.easeSinIn })
        originY.set(fy, { duration: 1000, interpolate: d3.interpolateNumber, easing: d3.easeSinIn })
      }
      else {
        originX.set(fx)
        originY.set(fy)
        originAlpha.set(1, { delay })

      }


     
    }

    else if (layout === 'radial') {
      const { radians } = data
      const rotation = radians - Math.PI/2

      const delayScale = d3.scaleLinear()
        .domain([-Math.PI/2, 2*Math.PI-Math.PI/2])
        .range([0, 700])

      originX.set(0)
      originY.set(0)
      containerX.set(fx)

      if (state === "entrance") {
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

        containerY.set(config.innerRadius)
        containerY.set(fy, { ...options, delay: Math.max(0, options.delay-100), duration: 500})
      }

      else if (state === "idle") {
        originRotation.set(rotation)
      }

    }

  }

</script>

<Pokemon parent={container} {node}/>