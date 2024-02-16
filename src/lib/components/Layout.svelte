<!-- 
  This component controls the layout, its variables, changes, and 
  the final positions of the nodes based on the current layout
 -->

<script>
  import { getContext } from "svelte";
  import { gsap } from "gsap";
  import * as d3 from "d3";

  // Components
  import Node from "$lib/components/Node.svelte";

  // Stores
  import { width, height, figureWidth, figureHeight } from "$lib/stores/canvas";
  import { zoomBehaviour, updateExtents } from "$lib/stores/zoom";
  import { nodes, nodeSize, gap, sortBy, selected } from "$lib/stores/nodes"; 

  // Helpers
  import getPosRadial from "$lib/helpers/getPosRadial"
  import getPosBlock from "$lib/helpers/getPosBlock"

  // Config
  import layoutConfig from "$lib/config/layout"
  const { shifts } = layoutConfig;


  // Exports
  export let layout
  

  const { resetZoom } = getContext("viz")
  
  
  let castableNodes = []
  
  const dummyNode = { id: -1, active: true, fx: 0, fy: 0 }
  const simulation = d3.forceSimulation()
    .alphaTarget(0.3) // stay hot
    .velocityDecay(0.1) // low friction
    .force("x", d3.forceX().x(d => 0).strength(0.01))
    .force("y", d3.forceY().y(d => 0).strength(0.01))
    .force("collide", d3.forceCollide())
    .force("charge", d3.forceManyBody())
  

  // ------------ Timelines ------------
  const tlState = gsap.timeline()
  const tlLayout = gsap.timeline()

  console.log($nodes)
  // ------------ State Management ------------
  let curLayout = layout
  let state = 'entrance'

  const config = { 
    cur: undefined, 
    prev: undefined, 
    set: updateConfig 
  }

  let prevCount = $nodes.activeCount

  tlState.add(() => {
    state = 'idle'
  }, `+=${shifts}`)


  // ------------ Reactivity ------------
  // reactive declarations are executed in batch.
  // reactive declarations are executed in order of their dependency. 
  // If no dependency, they are executed in the code order.
  $: {
    // If layout is changed
    if (layout != curLayout) {
      switchLayout(layout)
    }

    // Data filtered
    if (prevCount != $nodes.activeCount) {
      filtered()
    }
  }


  $: updateExtents(curLayout, $width, $height, $figureWidth, $figureHeight)
  $: switchSelected($selected.active)

  $: settings = {
    layout: curLayout,
    state,
    config,
  }

  $: dimensions = {
    fw: $figureWidth,
    fh: $figureHeight,
    nodeSize: $nodeSize,
    gap: $gap
  }

  $: prepareNodes(
    $nodes, 
    $sortBy,
    settings,
    dimensions,
    { zoomExtent: updateZoomExtent }
  )


  // Layouts
  function prepareNodes(nodes, groupBy, settings, dimensions, update) {
    console.log({ nodes: nodes.length, groupBy, settings, dimensions, update })

    const preCastableNodes = [
      dummyNode,
      ...nodes.map(node => ({ 
        ...node, 
        x: node.pos?.fx ? node.pos.fx : 0, 
        y: node.pos?.fy ? node.pos.fy : 0
      }))
    ]

    preCastableNodes.activeCount = nodes.activeCount

    const getPos = getPosFactory(preCastableNodes, groupBy, settings, dimensions, update)

    castableNodes = preCastableNodes.map(node => {
      const pos = getPos(node)
      return node.id === -1 
        ? node 
        : { ...node, pos }
    })

    if (state === 'selected') {
      simulation
        .nodes(castableNodes)
        .on("tick", () => {
          castableNodes.forEach(node => {
            if (node.id !== -1) {
              node.pos.fx = node.x
              node.pos.fy = node.y
            }
          })

          castableNodes = castableNodes
        })
    } else {
      // simulation.stop()
    }

  }


  function getPosFactory(preCastableNodes, groupBy, settings, dimensions, update) {
    if (state === 'selected') {
      const { nodeSize, fw, fh } = dimensions

      const minSize = Math.max(fw, fh)
      console.log(minSize)
      const collideRadius = d => d.active ? d.id === -1 ? minSize * .45 : nodeSize/2 : 0
      simulation.force("collide").radius(collideRadius)

      const chargeStrength = d => !d.active || d.id === -1 ? -2 : -5
      simulation.force("charge").strength(chargeStrength)

      return (node) => ({ fx: node.x, fy: node.y, })
    } 
    else if (layout === 'block') {
      return getPosBlock(preCastableNodes, settings, dimensions, update)
    }
    else if (layout === 'radial') {
      return getPosRadial(preCastableNodes, groupBy, settings, dimensions, update)
    }
  }


  function switchLayout(newLayout) {
    // console.log(`switchLayout ${curLayout} -> ${newLayout}`)

    if (state !== 'selected') {
      tlLayout.clear()
      tlState.clear()

      tlState.add(() => {
        state = 'exit'
      }, `+=0`)
      
  
      tlLayout.add(() => {
        curLayout = newLayout
        resetZoom()
      }, `+=${shifts}`)
  
      tlState.add(() => {
        state = 'entrance'
      }, `+=${shifts}`)

      tlState.add(() => {
        state = 'idle'
      }, `+=${shifts}`)
    }
    else {
      curLayout = newLayout
    }

  }


  function filtered() {
    // console.log('filtered')

    const isExclusion = prevCount > $nodes.activeCount

    tlState.clear()
    
    // First step on exclusion is to _filter_ out, then move
    // First step on inclusion is to _move_, then filter in
    state = isExclusion ? 'filter' : 'move'
      
    tlState.add(() => {
      state = isExclusion ? 'move' : 'filter'
    }, `+=${shifts}`)

    tlState.add(() => {
      state = 'idle'
    }, `+=${shifts}`)

    prevCount = $nodes.activeCount
  }


  function switchSelected(isActive) {
    console.log('\tswitchSelected')
    if (isActive) {
      tlState.clear()
      state = 'selected'
    } else if (state === 'selected') {
      state = 'idle'
    }
  }


  function updateZoomExtent(extent, reset=true) {
    zoomBehaviour.translateExtent(extent)
    if (reset) {
      resetZoom(0)
    }
  }


  function updateConfig(newConfig) {
    config.prev = config.cur
    config.cur = newConfig
    return config
  }





</script>

{#each castableNodes as node (node.id)}
  {#if node.id !== -1}
    <Node 
      {...node} 
      layout={settings.layout}
      state={settings.state}
      config={settings.config.cur}
    />
  {/if}
{/each}

<ul
  style:position="absolute"
  style:bottom=0
  style:right=0
  style:z-index=10
  style:font-weight=700
  style:color="yellow"
  style:background="grey"
>
  <li>Layout: {curLayout.toUpperCase()}</li>
  <li>State: {state.toUpperCase()}</li>
</ul>