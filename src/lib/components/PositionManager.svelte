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
  
  // ----- IDLE POS CALCULATOR -----
  let getPos

  const getPosFactory = (layout, nodes, groupBy, dimensions, update) => {
    const { fw, fh } = dimensions
    
    if (fw + fh === 0) {
      return
    }

    getPos = layout === 'block'
      ? getPosBlock(nodes, dimensions, update)
      : getPosRadial(nodes, groupBy, dimensions, update)
  }


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

  const simulation = d3.forceSimulation()
    .alphaTarget(0.3) // stay hot
    .velocityDecay(0.25) // low friction
    .force("charge", d3.forceManyBody().strength(-5))
    .force("x", forceX)
    .force("y", forceY)
    .force("collide", forceCollide)
    .on("tick", ticked)
    .nodes(simulationNodes)

  const tlDummy = gsap.timeline()
    .pause()
    .eventCallback('onUpdate', () => forceCollide.radius(forceCollideRadius))


  $: dimensions = {
    fw: $figureWidth,
    fh: $figureHeight,
    nodeSize: $nodeSize,
    gap: $gap
  }

  $: console.log((+(new Date())/1000).toFixed(3), $figureWidth, $figureHeight)

  // When selected statement is triggered
  $: selectedTriggered(state === "selected")

  $: getPosFactory(layout, $nodes, $sortBy, dimensions, { 
    zoomExtent: updateZoomExtent 
  })

  $: if ($figureWidth && $figureHeight) {
    forceCollide.radius(forceCollideRadius)
  } 

  $: if ($cameraOffset) {
    forceX.x(forceXPos)
    forceY.y(forceYPos)
  }

    


  // // Layouts



  function selectedTriggered(isSelected) {
    // This is supposed to be called only when 
    // the state selected is entered or exited
    // State changes from one state to another that is not selected should not trigger it.
    
    if (isSelected && !tlDummy.isActive()) {
      tlDummy.restart()
        .fromTo(dummyNode, 
          { fx: $selected.x, fy: $selected.y },
          { fx: 0 - $cameraOffset.x, fy: 0 - $cameraOffset.y, duration: .300, ease: d3.easeCubicOut })
        .fromTo(dummyNode, 
          { r: 0 },
          { r: Math.max($figureWidth, $figureHeight) * .4, duration: .150, ease: d3.easeCubicOut }, '<=')
    }

    else if (!isSelected) {
      tlDummy.clear().pause()
      dummyNode.r = 0
      forceCollide.radius(forceCollideRadius)
    }
  }


  function ticked() {
    // This is the function that position the nodes on the canvas

    
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


{#if getPos}
  {#each $dataset as node (node.id)}
    {#if node.id !== -1}
      {@const simulationNode = simulationNodes.find(d => d.id === node.id)}
      <Node 
        id={node.id}
        simulationNode={simulationNode}
        pos={getPos(simulationNode.getRef())}
        layout={layout}
        state={state}
        config={getPos.config}
      />
    {/if}
  {/each}
{/if}