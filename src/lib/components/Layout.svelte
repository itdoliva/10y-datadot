<script>
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";
  import * as d3 from "d3";
  import { 
    figureWidth, 
    figureHeight, 
    cameraOffset, 
    dragStart, 
    isDragging, 
    initialPinchDistance, 
    zoom, 
    lastZoom, 
    zoomSensitivity 
  } from "$lib/store/canvas";
  import { nodes, nNodes, nodeSize, gap } from "$lib/store/nodes";

  export let isBlock
  export let sortBy

  const canvasContexts = {}
  const radMaxStacks = 10

  const _isBlock = writable(isBlock)
  const _sortBy = writable(sortBy)
  
  $: sortIds(sortBy)

  $: $_isBlock = isBlock
  $: $_sortBy = sortBy

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
      const aspectRatio = $figureWidth / $figureHeight
      let rows = Math.ceil(Math.sqrt($nNodes / aspectRatio))
      let columns = Math.ceil(aspectRatio * rows)

      let blockWidth = columns * ($nodeSize + $gap) - $gap
      while (blockWidth > $figureWidth) {
        columns--
        blockWidth = columns * ($nodeSize + $gap) - $gap
        rows = Math.ceil($nNodes / columns)
      }

      const blockHeight = Math.ceil($nNodes / columns) * ($nodeSize + $gap) - $gap


      const padding = {
        left: ($figureWidth - blockWidth)/2,
        top: ($figureHeight - blockHeight)/2
      }

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

      const xScale = d3.scaleBand()
        .domain(domain)
        .range([ 0, 2*Math.PI ])
        .paddingInner(.2)
        .paddingOuter(.1)

      const nBars = ~~(d3.max([...groupedNodes.values()], d => d.length) / radMaxStacks)
      const barPosScale = d3.scaleBand()
        .domain(d3.range(0, nBars, 1))
        .range([0, xScale.bandwidth()])

      return (node) => {
        // Get category of sector
        const category = node[$sortBy]

        // Get occurrence of this node in the group of nodes with the same category
        const catNodes = groupedNodes.get(category)
        const nodeIndex = catNodes.findIndex(d => d.id === node.id)
        const barIndex = Math.floor(nodeIndex / radMaxStacks)
        const stackIndex = nodeIndex % radMaxStacks

        const radians = xScale(category) + barPosScale(barIndex)
        const radius = 200 + stackIndex * ($nodeSize + $gap)
        
        const x = Math.cos(radians) * radius + $figureWidth/2
        const y = Math.sin(radians) * radius + $figureHeight/2

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


  // Event Handlers
  // Gets the relevant location from a mouse or single touch event
  function getEventLocation(e) {
    if (e.touches && e.touches.length == 1) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY) {
      return { x: e.clientX, y: e.clientY }        
    }
  }

  function onPointerDown(e) {
    const { x, y } = getEventLocation(e)
    dragStart.set(x - $cameraOffset.x, y - $cameraOffset.y)
    isDragging.set(true)
  }


  function onPointerUp(e) {
      isDragging.set(false)
      initialPinchDistance.set(null)
      lastZoom.set($zoom)
  }


  function onPointerMove(e) {
    if ($isDragging) {
      const { x, y } = getEventLocation(e)
      cameraOffset.set(x - $dragStart.x, y - $dragStart.y)
    }
  }


  function adjustZoom({ deltaY }, zoomFactor) {
    if ($isDragging) {
      return
    }

    if (deltaY) {
      const zoomAmount = deltaY * $zoomSensitivity
      zoom.updateK(-zoomAmount)
    }
    else if (zoomFactor) {
      zoom.setK(zoomFactor*$lastZoom)
    }
  }


  function handleTouch(e, singleTouchHandler) {
    if (e.touches.length == 1 ) {
      singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2) {
      isDragging.set(false)
      handlePinch(e)
    }
  }


  function handlePinch(e) {
    e.preventDefault()
    
    const touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    
    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    const currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
    if ($initialPinchDistance == null) {
      initialPinchDistance.set(currentDistance)
    }
    else {
      adjustZoom(null, currentDistance/$initialPinchDistance )
    }
  }

</script>


<div 
  class="wrapper"
  bind:clientWidth={$figureWidth}
  bind:clientHeight={$figureHeight}
  on:mousedown={onPointerDown}
  on:mouseup={onPointerUp}
  on:mousemove={onPointerMove}
  on:wheel={adjustZoom}
  on:touchstart={e => handleTouch(e, onPointerDown)}
  on:touchend={e => handleTouch(e, onPointerUp)}
  on:touchmove={e => handleTouch(e, onPointerMove)}
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