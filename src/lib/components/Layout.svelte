<script>
  import { onMount, setContext } from "svelte";
  import { writable, derived } from "svelte/store";
  import * as d3 from "d3";
  import { 
    figureWidth, 
    figureHeight, 
    cameraOffset, 
    zoom, 
    isDragging
  } from "$lib/store/canvas";
  import { nodes, nNodes, nodeSize, gap } from "$lib/store/nodes";

  export let isBlock
  export let sortBy

  let wrapper

  const canvasContexts = {}
  const radMaxStacks = 10

  const _isBlock = writable(isBlock)
  const _sortBy = writable(sortBy)


  $: sortIds(sortBy)

  $: $_isBlock = isBlock
  $: $_sortBy = sortBy

  $: $_isBlock, resetZoom()


  onMount(() => {
    d3.select(wrapper).call(zoomBehaviour)
  })  

  // Zoom functions
  const zoomBehaviour = d3.zoom()
    .on("start", onZoomStart)
    .on("zoom", zoomed)
    .on("end", onZoomEnd)
  

  function resetZoom() {
    d3.select(wrapper)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .call(zoomBehaviour.transform, d3.zoomIdentity)
  }


  function zoomed({ transform }) {
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



</script>


<div 
  bind:this={wrapper}
  class="wrapper"
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