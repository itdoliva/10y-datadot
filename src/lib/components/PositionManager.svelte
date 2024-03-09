 <script>
	import { DummySimulationNode, SimulationNode } from './SimulationNode.ts';
  import { getContext } from "svelte";

  import * as d3 from "d3";
  import { gsap } from "gsap";

  // Components
  import Node from "$lib/components/Node.svelte";

  // Stores
  import { figureWidth, figureHeight } from "$lib/stores/canvas";
  import { dataset, nodes, nodeSize, gap, sortBy, selected } from "$lib/stores/nodes"; 
  import { zoomBehaviour, cameraOffset } from "$lib/stores/zoom";

  // Helpers
  import getPosRadial from "$lib/helpers/getPosRadial"
  import getPosBlock from "$lib/helpers/getPosBlock"

  // Exports
  export let layout
  export let state

  const { resetZoom } = getContext("viz")
  
  // ----- SIMULATION -----

  // Dummy node used for repelling other nodes
  const dummyNode = new DummySimulationNode()
  const simulationNodes = [ 
    dummyNode,
    ...$dataset.map(({ id }) => new SimulationNode(id))
  ]

  const forceCollideRadius = (node) => node.isActive()
    ? node.id === -1 ? node.r : $nodeSize
    : 0

  const forceXPos = () => 0 - $cameraOffset.x
  const forceYPos = () => 0 - $cameraOffset.y
  
  const forceCollide = d3.forceCollide().radius(forceCollideRadius)
  const forceX = d3.forceX().x(forceXPos).strength(0.005)
  const forceY = d3.forceY().y(forceYPos).strength(0.005)

  d3.forceSimulation()
    .alphaTarget(0.3) // stay hot
    .velocityDecay(0.25) // low friction
    .force("charge", d3.forceManyBody().strength(-5))
    .force("x", forceX)
    .force("y", forceY)
    .force("collide", forceCollide)
    .on("tick", ticked)
    .nodes(simulationNodes)

    dummyNode.tl
      .eventCallback('onUpdate', () => forceCollide.radius(forceCollideRadius))


  // ----- IDLE POS CALCULATOR -----

  const setNodeIdlePositions = (layout, nodes, groupBy, dimensions, update) => {
    const { fw, fh } = dimensions
    
    if (fw + fh === 0) {
      return
    }

    const getPos = layout === 'block'
      ? getPosBlock(nodes, dimensions, update)
      : getPosRadial(nodes, groupBy, dimensions, update)

    simulationNodes.forEach(simulationNode => {
      simulationNode.setPos(getPos)
    })

  }

  $: dimensions = {
    fw: $figureWidth,
    fh: $figureHeight,
    nodeSize: $nodeSize,
    gap: $gap
  }

  $: console.log((+(new Date())/1000).toFixed(3), $figureWidth, $figureHeight)

  // When selected statement is triggered
  $: dummyNode.playSwitchSelected(state === "selected")

  $: setNodeIdlePositions(layout, $nodes, $sortBy, dimensions, { 
    zoomExtent: updateZoomExtent 
  })

  $: if ($figureWidth && $figureHeight) {
    forceCollide.radius(forceCollideRadius)
  } 

  $: if ($cameraOffset) {
    forceX.x(forceXPos)
    forceY.y(forceYPos)
  }


  function ticked() {
    // This is the function that position the nodes on the canvas

    return simulationNodes.forEach(simulationNode => {
      simulationNode.tick()
    })

    if (state === 'selected') {
      simulationNodes.forEach(simulationNode => {
        // Selected Node
        if (simulationNode.id === $selected.id) {

        }
        // Non Selected Node
        else if (simulationNode.id !== -1) {
          simulationNode.fx = undefined
          simulationNode.fy = undefined
          simulationNode.tweenCoord.x = simulationNode.x
          simulationNode.tweenCoord.y = simulationNode.y
        }
        // Dummy Node
        else {
          // simulationNode.r = dummyNode.r
          // simulationNode.fx = dummyNode.fx
          // simulationNode.fy = dummyNode.fy
        }
      })
    }

    else {
      simulationNodes.forEach(simulationNode => {
        // Non Dummy Node
        if (simulationNode.id !== -1) {
          // simulationNode.fx = simulationNode.t.x
          // simulationNode.fy = simulationNode.t.y
        }
        // Dummy Node
        else {

        }
      })
    }
  }


  function updateZoomExtent(extent, reset=true) {
    zoomBehaviour.translateExtent(extent)
    if (reset) resetZoom(0)
  }



</script>


{#each $dataset as node (node.id)}
  {#if node.id !== -1}
    {@const simulationNode = simulationNodes.find(d => d.id === node.id)}
    <Node 
      id={node.id}
      simulationNode={simulationNode}
      layout={layout}
      state={state}
    />
  {/if}
{/each}