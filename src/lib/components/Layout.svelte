<script>
  import { onMount, setContext } from "svelte";
  import { writable, derived } from "svelte/store";
  import * as d3 from "d3";
  import { 
    width,
    height,
    figureWidth, 
    figureHeight, 
    cameraOffset, 
    zoom, 
    isDragging
  } from "$lib/store/canvas";
  import { nodes, nNodes, nodeSize, gap } from "$lib/store/nodes";
  import getBlockConfig from "$lib/helpers/getBlockConfig"

  export let isBlock
  export let sortBy

  let wrapper

  const canvasContexts = {}
  const radMaxStacks = 10
  const innerRadius = 180

  const zoomBehaviour = d3.zoom()
    .on("start", onZoomStart)
    .on("zoom", zoomed)
    .on("end", onZoomEnd)


  const _isBlock = writable(isBlock)
  const _sortBy = writable(sortBy)
  const _translateExtent = writable(null)
  const _scaleExtent = writable(null)


  $: sortIds(sortBy)

  $: $_isBlock = isBlock
  $: $_isBlock, resetZoom()
  $: $_sortBy = sortBy
  $: updateExtents($_isBlock, $width, $height, $figureWidth, $figureHeight)
  // $: console.log({ extent: zoomBehaviour.extent(), translateExtent: zoomBehaviour.translateExtent() })

  onMount(() => {
    d3.select(wrapper)
      .call(zoomBehaviour)
      .on("wheel", event => event.preventDefault())
  })  


  // Zoom functions
  function updateExtents(isBlock, ww, wh, fw, fh) {
    const extentX = [0, fw]
    const extentY = [0, fh]
    const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])
    zoomBehaviour.extent(extent)

    if (ww < 768 && !isBlock) {
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


  function zoomed({ transform }) {
    console.log({ 
      k: +transform.k.toFixed(1), 
      x: +transform.x.toFixed(1), 
      y: +transform.y.toFixed(1), 
    }, {
      extent: zoomBehaviour.extent(),
      translateExtent: zoomBehaviour.translateExtent(),
    })
    cameraOffset.set(transform.x, transform.y)
    zoom.setK(transform.k)
  }


  function onZoomStart() {
    isDragging.set(true)
  }


  function onZoomEnd() {
    isDragging.set(false)
  }


  // Functions
  function sortIds(sortBy) {
    nodes.update(oldNodes => {
      return oldNodes
        .sort((a, b) => a[sortBy] - b[sortBy])
        .map((item, i) => ({ ...item, i }))
    })
  }

  
  const getPos_d = derived([_isBlock, _sortBy, nNodes, nodeSize, gap, figureWidth, figureHeight], 
  ([$isBlock, $sortBy, $nNodes, $nodeSize, $gap, $figureWidth, $figureHeight]) => {
    // --------------- //
    // Blocked Layout
    // --------------- //
    if ($isBlock) {

      const { columns, blockWidth, blockHeight } = getBlockConfig($nNodes, $nodeSize, $gap, $figureWidth, $figureHeight)

      const padding = {}
      padding.left = ($figureWidth - blockWidth)/2

      let tExtentY
      if (blockHeight < $figureHeight) {
        padding.top = ($figureHeight - blockHeight)/2
        tExtentY = [0, $figureHeight]
      }
      else {
        padding.top = $nodeSize
        tExtentY = [0, blockHeight + 2*$nodeSize]
      }

      // Adjust zoom
      const tExtentX = [0, $figureWidth]
      zoomBehaviour.translateExtent(tExtentX.map((_, i) => [ tExtentX[i], tExtentY[i] ]))
      resetZoom(0)


      return ({ i }) => {
        // Calculate the row and column indices for the given i
        const iCol = Math.floor(i % columns)
        const iRow = Math.floor(i / columns)

        const x = iCol * ($nodeSize + $gap) + $nodeSize/2 + padding.left
        const y = iRow * ($nodeSize + $gap) + $nodeSize/2 + padding.top

        return { x, y }
      }
    }

    // --------------- //
    // Radial Layout
    // --------------- //
    else {
      const groupedNodes = d3.group($nodes, d => d[$sortBy])

      const domain = $sortBy === 'year'
        ? d3.range(2014, 2024, 1)
        : [ 0, 1 ]

      const innerPad = .15
      const xScale = d3.scaleBand()
        .domain(domain)
        .range([ 0, 2*Math.PI ])
        .paddingInner(innerPad)
        .paddingOuter(innerPad/2)

      const nBars = ~~(d3.max([...groupedNodes.values()], d => d.length) / radMaxStacks)
      const barPosScale = d3.scaleBand()
        .domain(d3.range(0, nBars, 1))
        .range([0, xScale.bandwidth()])

      const padding = {
        left: $figureWidth/2,
        top: $figureHeight/2
      }

    
      const layoutSize = 2*(innerRadius + radMaxStacks * ($nodeSize + $gap))
      let tExtentX = [0, $figureWidth]
      let tExtentY = [0, $figureHeight]

      if (layoutSize > $figureWidth) {
        const exceed = layoutSize - $figureWidth
        tExtentX = [-exceed/2, $figureWidth+exceed/2]
      }

      if (layoutSize > $figureHeight) {
        const exceed = layoutSize - $figureHeight
        tExtentY = [-exceed/2, $figureHeight+exceed/2]
      }

      // Adjust zoom
      zoomBehaviour.translateExtent(tExtentX.map((_, i) => [ tExtentX[i], tExtentY[i] ]))
      resetZoom(0)

      return (node) => {
        // Get category of sector
        const category = node[$sortBy]

        // Get occurrence of this node in the group of nodes with the same category
        const catNodes = groupedNodes.get(category)
        const nodeIndex = catNodes.findIndex(d => d.id === node.id)
        const barIndex = Math.floor(nodeIndex / radMaxStacks)
        const stackIndex = nodeIndex % radMaxStacks

        const radians = xScale(category) + barPosScale(barIndex)
        const radius = innerRadius + stackIndex * ($nodeSize + $gap)
        
        const x = Math.cos(radians) * radius + padding.left
        const y = Math.sin(radians) * radius + padding.top

        return { x, y, rotation: radians }
      }
    }
  })


  $: context = {
    canvasContexts,
    addCanvasContext: (key, ctx) => canvasContexts[key] = ctx,
    getPos: getPos_d,
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