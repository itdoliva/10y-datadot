 <script>
	import { DummySimulationNode, SimulationNode } from './SimulationNode.ts';
	import { tweened } from 'svelte/motion';
  import { onMount, getContext } from "svelte";
  import { get } from 'svelte/store';

  import * as d3 from "d3";
  import { gsap } from "gsap";

  // Components
  import Node from "$lib/components/Node.svelte";

  // Stores
  import { figureWidth, figureHeight } from "$lib/stores/canvas";
  import { dataset, nodes, nodeSize, gap, sortBy, selected } from "$lib/stores/nodes"; 
  import { zoomBehaviour } from "$lib/stores/zoom";

  // Helpers
  import getPosRadial from "$lib/helpers/getPosRadial"
  import getPosBlock from "$lib/helpers/getPosBlock"

  // Config
  import layoutConfig from "$lib/config/layout"
  const { shifts } = layoutConfig;

  // Exports
  export let layout
  export let state

  const { resetZoom } = getContext("viz")
  
  const config = { cur: undefined, prev: undefined }

  // Dummy node used for repelling other nodes
  const dummyNode = new DummySimulationNode()

  const simulationNodes = [ 
    dummyNode,
    ...$dataset.map(({ id }) => new SimulationNode(id))
  ]

  // Simulation
  const collideRadius = (node) => !node.isActive()
      ? 0
      : node.id === -1 ? node.r : $nodeSize

  const forceCollide = d3.forceCollide().radius(collideRadius)

  const forceCharge = d3.forceManyBody()
    .strength(node => !node.isActive() || node.id === -1
      ? -2
      : -5)

  const simulation = d3.forceSimulation()
    .alphaTarget(0.3) // stay hot
    .velocityDecay(0.25) // low friction
    .force("x", d3.forceX().x(d => 0).strength(0.005))
    .force("y", d3.forceY().y(d => 0).strength(0.005))
    .force("collide", forceCollide)
    .force("charge", forceCharge)
    .on("tick", ticked)
    .nodes(simulationNodes)
    // .stop()


  const tlDummy = gsap.timeline()
    .pause()
    .eventCallback('onUpdate', () => forceCollide.radius(collideRadius))

  $: settings = {
    layout,
    state,
    config
  }

  $: dimensions = {
    fw: $figureWidth,
    fh: $figureHeight,
    nodeSize: $nodeSize,
    gap: $gap
  }

  // When selected statement is triggered
  $: selectedTriggered(state === "selected")

  $: $figureWidth && $figureHeight && forceCollide.radius(collideRadius)

  $: getPos = getPosFactory($nodes, $sortBy, settings, dimensions, { 
    config: updateConfig, 
    zoomExtent: updateZoomExtent 
  })

  // // Layouts
  function getPosFactory(nodes, groupBy, settings, dimensions, update) {
    if (layout === 'block') {
      return getPosBlock(nodes, settings, dimensions, update)
    }
    else if (layout === 'radial') {
      return getPosRadial(nodes, groupBy, settings, dimensions, update)
    }
  }


  function selectedTriggered(isSelected) {
    // This is supposed to be called only when 
    // the state selected is entered or exited
    // State changes from one state to another that is not selected should not trigger it.
    
    if (isSelected && !tlDummy.isActive()) {
      tlDummy.restart()
        .fromTo(dummyNode, { fx: $selected.x, fy: $selected.y },
          { fx: 0, fy: 0, duration: .300, ease: d3.easeCubicOut })
        .fromTo(dummyNode, { r: 0 },
          { r: Math.max($figureWidth, $figureHeight) * .4, duration: .150, ease: d3.easeCubicOut }, '<=')
    }

    else if (!isSelected) {
      tlDummy.clear().pause()
      dummyNode.r = 0
      forceCollide.radius(collideRadius)
    }
  }


  function ticked() {
    if (!getPos) {
      return
    }

    if (state === 'selected') {

      simulationNodes.forEach(simulationNode => {
        // Selected Node
        if (simulationNode.id === $selected.id) {

        }
        // Non Selected Node
        else if (simulationNode.id !== -1) {
          simulationNode.fx = undefined
          simulationNode.fy = undefined
          simulationNode.t.x = simulationNode.x
          simulationNode.t.y = simulationNode.y
        }
        // Dummy Node
        else {
          simulationNode.r = dummyNode.r
          simulationNode.fx = dummyNode.fx
          simulationNode.fy = dummyNode.fy
        }
      })
    }

    else {
      simulationNodes.forEach(simulationNode => {
        // Non Dummy Node
        if (simulationNode.id !== -1) {
          simulationNode.fx = simulationNode.t.x
          simulationNode.fy = simulationNode.t  .y
        }
        // Dummy Node
        else {

        }
      })
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

{#each $dataset as node (node.id)}
  {#if node.id !== -1}
    {@const simulationNode = simulationNodes.find(d => d.id === node.id)}
    <Node 
      id={node.id}
      simulationNode={simulationNode}
      pos={getPos(simulationNode.getRef())}
      layout={layout}
      state={state}
      config={config.cur}
    />
  {/if}
{/each}



<!-- // function prepareNodes(nodes, groupBy, settings, dimensions, update) {
  //   console.log({ nodes: nodes.length, groupBy, settings, dimensions, update })

  //   const preCastableNodes = [
  //     dummyNode,
  //     ...nodes.map(node => ({ 
  //       ...node, 
  //       x: node.pos?.fx ? node.pos.fx : 0, 
  //       y: node.pos?.fy ? node.pos.fy : 0
  //     }))
  //   ]

  //   preCastableNodes.activeCount = nodes.activeCount

  //   const getPos = getPosFactory(preCastableNodes, groupBy, settings, dimensions, update)

  //   castableNodes = preCastableNodes.map(node => {
  //     const pos = getPos(node)
  //     return node.id === -1 
  //       ? node 
  //       : { ...node, pos }
  //   })

  //   if (state === 'selected') {
  //     simulation
  //       .nodes(castableNodes)
  //       .on("tick", () => {
  //         castableNodes.forEach(node => {
  //           if (node.id !== -1) {
  //             node.pos.fx = node.x
  //             node.pos.fy = node.y
  //           }
  //         })

  //         castableNodes = castableNodes
  //       })
  //   } else {
  //     // simulation.stop()
  //   }

  // } -->
