<script>
  import { getContext } from "svelte";
  import * as d3 from "d3"

  import Simulation from '$lib/simulation/Simulation';

  // Components
  import Node from "$lib/components/webgl/molecules/Node.svelte";
  import Link from '$lib/components/webgl/atoms/Link.svelte';

  // Stores
  import { width, height, figureWidth, figureHeight, complexityOn, linkProjectOn, linkClientOn } from "$lib/stores/canvas";
  import { cameraOffsetX, cameraOffsetY } from "$lib/stores/zoom";
  import { nodes, selected, sortBy, dataset, projects, clients, nodeSize, gap } from "$lib/stores/nodes"; 

  // Exports
  export let layout

  let prevActiveIds = $nodes.activeIds


  // ----- SIMULATION -----
  const simulation = new Simulation(layout, "entrance")

  // ------------ Reactivity ------------  

  // Update zoom
  // $: updateExtents(simulation.layout, $width, $height, $figureWidth, $figureHeight)

  // Update simulation Force Properties
  $: if ($figureWidth || $figureHeight) {
    simulation.updateCollideRadius()
  } 

  $: simulation.updateCoordPos($cameraOffsetX, $cameraOffsetY)

  // If layout is changed
  $: simulation.switchLayout(layout)

  // If nodes are resorted
  $: simulation.resorted($sortBy)

  // If data is filtered
  $: if (d3.zip(prevActiveIds, $nodes.activeIds).some(([ a, b ]) => a !== b)) {
    const isExclusion = prevActiveIds.length > $nodes.activeCount
    simulation.filtered(isExclusion)
    prevActiveIds = $nodes.activeIds
  }

  // When selected statement is triggered
  $: simulation.toggleSelected($selected)

  // When toggle complexity
  $: simulation.toggleComplexity($complexityOn)



  // $: zoomController.translateExtent(simulation.config.extent)




  // function updateExtents(layout, ww, wh, fw, fh) {
  //   const extentX = [0, fw]
  //   const extentY = [0, fh]
  //   const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])
  //   zoomBehaviour.extent(extent)

  //   if (ww < 768 && layout === 'radial') {
  //     zoomBehaviour.scaleExtent([.3, 1])
  //   }
  //   else {
  //     zoomBehaviour.scaleExtent([1, 1])
  //   }
  // }

</script>

{#each $projects as project}
  <Link
    type="project"
    id={project.id}
    color={0X818AFC}
    linkNodes={simulation.getNodesByProjectId(project.id)}
    isLinkOn={$linkProjectOn && (simulation.command.state === "idle" || simulation.command.state === "selected")}
  />
{/each}

{#each $clients as client}
  <Link 
    type="client"
    id={client.id}
    color={0x83BF00}
    linkNodes={simulation.getNodesByClientId(client.id)}
    isLinkOn={$linkClientOn && (simulation.command.state === "idle" || simulation.command.state === "selected")}
  />
{/each}

{#each $dataset as node (node.id)}
  {#if node.id !== -1}
    <Node 
      id={node.id}
      simulationNode={simulation.getNodeById(node.id)}
      state={simulation.command.state}
    />
  {/if}
{/each}

<!-- <ul
  style:position="absolute"
  style:bottom=0
  style:right=0
  style:z-index=10
  style:font-weight=700
  style:background="white"
>
  <li>Layout: {simulation.command.layout.toUpperCase()}</li>
  <li>State: 
    <span 
      style:color={(() => {
        if (simulation.command.state === 'idle') return "black"
        else if (simulation.command.state === "selected") return "purple"
        else if (simulation.command.state === "filter") return "orange"
        else if (simulation.command.state === "move") return "cornflowerblue"
        else if (simulation.command.state === "entrance") return "green"
        else if (simulation.command.state === "exit") return "crimson"
      })()}
    style:font-weight=700
    >{simulation.command.state.toUpperCase()}</span></li>
</ul> -->