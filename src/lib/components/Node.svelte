<script>
	import { categories } from '$lib/store/categories';
  import { getContext, onMount } from "svelte";
  import geometries from "$lib/geometries"
  import * as d3 from "d3"
  import { figureWidth, figureHeight } from "$lib/store/canvas";
  import { nodeSize, gap } from "$lib/store/nodes";
  import Pokemon from "$lib/components/Pokemon.svelte";
  import * as PIXI from "pixi.js"

  export let node

  const { 
    getPos, 
    layout, 
    state, 
    config, 
    ticker, 
    padding, 
    duration,
    blockParams
  } = getContext("layout")

  const { container } = getContext("pixi")

  const parent = new PIXI.Container()

  container.addChild(parent)

  const channelGeometry = geometries[$categories.channels.find(d => d.id === node.channel).name].geometry
  const channelGraphic = new PIXI.Graphics(channelGeometry)


  if (node.designs.includes(0)) {
    parent.addChild(new PIXI.Graphics(geometries.illustration.geometry))
  }

  parent.addChild(channelGraphic)




  const exitAt = (duration/1000) * .5 * Math.random()
  const exitTickerScale = d3.scaleLinear()
    .domain([exitAt, 1])
    .clamp(true)

  let x = 0
  let y = 0
  let rotation
  let fx
  let fy
  let frotation
  let data

  $: setFinalPos($getPos)
  $: getCurrentPos($layout, $state, $config, $ticker)

  $: parent.x = x
  $: parent.y = y
  $: parent.renderable = node.active

  $: if (node.id === 0) {
    console.log({parent})
    // parent.children.forEach(graphic => graphic.geometry.graphicsData.lineStyle({ width: 4 }))
  }


  function setFinalPos(getPos) {
    const pos = getPos(node)
    fx = pos.x
    fy = pos.y
    frotation = pos.rotation
    data = pos.data
  }


  function getCurrentPos(layout, state, config, ticker) {
    if (state === 'idle') {
      x = fx
      y = fy
    }
    else if ( state === 'exit') {
      x = fx
      y = fy + d3.easeSinIn(exitTickerScale(ticker)) * $figureHeight
    }
    // Entrances \/
    else if (layout === 'block') {
      const { row, column } = data
      const colDensity = config.columnDensities[column]
      const entryAt = colDensity * blockParams.colEntranceUpTo + config.timeStepByRow * row

      if (ticker >= entryAt) {
        x = fx
        y = fy
      } else {
        x = undefined
        y = undefined
      }

      rotation = undefined
    }
    else if (layout === 'radial') {
      const { radians, radius } = data
      const easedTicker = d3.easeCubicInOut(ticker)
      const easeRadians = radians*easedTicker
      const easeRadius =  config.innerRadius + (radius-config.innerRadius)*d3.easeQuadOut(exitTickerScale(ticker))
      x = Math.cos(easeRadians) * (easeRadius)
      y = Math.sin(easeRadians) * (easeRadius)
      rotation = easeRadians
    }

  }



</script>

<!-- <Pokemon 
  {node} 
  x={x+$padding.left} 
  y={y+$padding.top} 
  {rotation} 
/> -->