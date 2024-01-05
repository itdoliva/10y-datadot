<script>
  import { beforeUpdate, setContext } from "svelte";
  import { writable, derived } from "svelte/store";
  import { tweened } from "svelte/motion";
  import * as d3 from "d3";
  import { gsap } from "gsap"

  import { width, height, figureWidth, figureHeight } from "$lib/store/canvas";
  import { zoomBehaviour } from "$lib/store/zoom";
  import { nodes, nNodes, nodeSize, gap } from "$lib/store/nodes";
  import getBlockConfig from "$lib/helpers/getBlockConfig"
  import getRadialConfig from "$lib/helpers/getRadialConfig"


  export let layout

  let wrapper

  const canvasContexts = {}

  // Radial layout
  const maxStacksK = .25
  const innerRadius = 180

  // Transition duration
  const duration = 1000

  const blockParams = {}
  blockParams.colEntranceUpTo = duration/1000 * .2
  blockParams.fullColEntranceDuration = duration/1000 - blockParams.colEntranceUpTo

  // Stores  
  const _layout = writable(layout)
  const _state = writable('idle')
  const _ticker = tweened(0, { duration })
  const _config = writable()
  const _padding = writable({ left: 0, top: 0 })


  $: $_layout, resetZoom()
  $: updateExtents($_layout, $width, $height, $figureWidth, $figureHeight)



  beforeUpdate(() => {
    if($_state != 'idle') {
      return
    }

    if ($_layout != layout) {
      switchLayout(layout)
    }
  })


  // Zoom functions
  function updateExtents(layout, ww, wh, fw, fh) {
    const extentX = [0, fw]
    const extentY = [0, fh]
    const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])
    zoomBehaviour.extent(extent)

    if (ww < 768 && layout === 'radial') {
      zoomBehaviour.scaleExtent([.3, 1])
    }
    else {
      zoomBehaviour.scaleExtent([1, 1])
    }
  }


  function resetZoom(duration=1000) {
    d3.select(wrapper)
      .transition()
      .duration(duration)
      .ease(d3.easeCubicInOut)
      .call(zoomBehaviour.transform, d3.zoomIdentity)
  }


  // Layouts
  function blockLayout(nodes, nNodes, nodeSize, gap, fw, fh) {
    const { 
      rows,
      columns,
      padding,
      extent,
    } = getBlockConfig(nNodes, nodeSize, gap, fw, fh)

    // The below calculations support block entrance animation
    const length = 100
    const dist = Array.from({ length }, d3.randomInt(columns))
    const bin = d3.bin().thresholds(d3.range(columns))
    const density = bin(dist).map(d => d.length/length)
    const maxDensity = d3.max(density)
    const normalizedDensity = density.map(d => +(d/maxDensity).toFixed(1))

    const timeStepByRow = +(blockParams.fullColEntranceDuration / rows).toFixed(4)

    _padding.set(padding)
    _config.set({
      rows,
      columns,
      columnDensities: normalizedDensity,
      timeStepByRow
    })

    // Adjust zoom
    zoomBehaviour.translateExtent(extent)
    resetZoom(0)

    // nodes.update(arr => arr.map(node => {
    //   node.fx 
    // }))

    return ({ i }) => {
      // Calculate the row and column indices for the given i
      const column = Math.floor(i % columns)
      const row = Math.floor(i / columns)

      const x = column * (nodeSize + gap) + nodeSize/2
      const y = row * (nodeSize + gap) + nodeSize/2

      return { x, y, data: { row, column } }
    }
  }


  function radialLayout(nodes, nNodes, nodeSize, gap, groupBy, fw, fh) {
    const {
      padding,
      extent,
      grouped,
      sectorRadiansScale,
      pileRadiansScale,
      maxStacks
    } = getRadialConfig(nodes, nNodes, nodeSize, gap, groupBy, innerRadius, maxStacksK, fw, fh)

    _padding.set(padding)
    _config.set({
      grouped,
      sectorRadiansScale,
      pileRadiansScale,
      innerRadius,
      maxStacks
    })

    // Adjust zoom
    zoomBehaviour.translateExtent(extent)
    resetZoom(0)

    return (node) => {
      // Get category of sector
      const catValue = node[groupBy]

      // Get occurrence of this node in the group of nodes with the same catValue
      const catNodes = grouped.get(catValue)
      const nodeIndex = catNodes.findIndex(d => d.id === node.id)
      const pileIndex = Math.floor(nodeIndex / maxStacks)
      const stackIndex = nodeIndex % maxStacks

      const radiansOffset = catNodes.diffPiles * pileRadiansScale.bandwidth()/2
      const radians = sectorRadiansScale(catValue) + pileRadiansScale(pileIndex) + radiansOffset

      const radius = innerRadius + stackIndex * (nodeSize + gap)
      
      const x = Math.cos(radians) * radius
      const y = Math.sin(radians) * radius

      return { x, y, rotation: radians, data: { radius, radians } }
    }
  }


  function switchLayout(newLayout) {
    const tl = gsap.timeline()

    tl.add(() => {
      _state.set('exit')
      _ticker.set(0, { duration: 0 })
      _ticker.set(1)
    })

    tl.add(() => {
      _layout.set(newLayout)
      _state.set('entrance')
      _ticker.set(0, { duration: 0 })
      _ticker.set(1)
    }, `+=${duration/1000}`)

    tl.add(() => _state.set('idle'), `+=${duration/1000}`)
  }

  
  const getPos_d = derived([_layout, nNodes, nodeSize, gap, figureWidth, figureHeight], 
  ([$layout, $nNodes, $nodeSize, $gap, $figureWidth, $figureHeight]) => {
    if ($layout === 'block') {
      return blockLayout($nodes, $nNodes, $nodeSize, $gap, $figureWidth, $figureHeight)
    }
    if ($layout === 'radial') {
      return radialLayout($nodes, $nNodes, $nodeSize, $gap, "year", $figureWidth, $figureHeight)
    }
  })


  $: context = {
    wrapper,
    canvasContexts,
    addCanvasContext: (key, ctx) => canvasContexts[key] = ctx,
    getPos: getPos_d,
    layout: _layout,
    state: _state,
    config: _config,
    ticker: _ticker,
    padding: _padding,
    duration,
    blockParams,
  }

  $: setContext('layout', context)



</script>


<div 
  class="wrapper"
  bind:this={wrapper}
  bind:clientWidth={$figureWidth}
  bind:clientHeight={$figureHeight}
>
  {#if $figureWidth > 100}
    <slot />
  {/if}
</div>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
  }
</style>