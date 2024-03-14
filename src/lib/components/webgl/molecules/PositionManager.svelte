 <script>
  import { getContext } from "svelte";
  
  import Simulation from '$lib/simulation/Simulation';

  // Components
  import Node from "$lib/components/webgl/molecules/Node.svelte";
  import Link from '$lib/components/webgl/atoms/Link.svelte';

  // Stores
  import { figureWidth, figureHeight, linkProjectOn, linkClientOn } from "$lib/stores/canvas";
  import { dataset, projects, clients, nodes, nodeSize, gap, sortBy, selected } from "$lib/stores/nodes"; 
  import { zoomBehaviour, cameraOffset } from "$lib/stores/zoom";

  // Exports
  export let layout
  export let state

  const { resetZoom } = getContext("viz")
  
  // ----- SIMULATION -----
  const simulation = new Simulation($dataset)

  $: dimensions = {
    fw: $figureWidth,
    fh: $figureHeight,
    nodeSize: $nodeSize,
    gap: $gap
  }

  $: console.log((+(new Date())/1000).toFixed(3), $figureWidth, $figureHeight)

  // When selected statement is triggered
  $: simulation.dummyNode.playSwitchSelected(state === "selected")

  $: simulation.setNodeIdlePositions(layout, $nodes, $sortBy, dimensions, { 
    zoomExtent: updateZoomExtent 
  })

  $: if ($figureWidth || $figureHeight) {
    simulation.updateCollideRadius()
  } 

  $: if ($cameraOffset) {
    simulation.updateCoordPos()
  }


  function updateZoomExtent(extent, reset=true) {
    zoomBehaviour.translateExtent(extent)
    if (reset) resetZoom(0)
  }



</script>

{#each $projects as project}
  <Link
    type="project"
    id={project.id}
    color={0X818AFC}
    linkNodes={simulation.getNodesByProjectId(project.id)}
    isLinkOn={$linkProjectOn && (state === "idle" || state === "selected")}
  />
{/each}

{#each $clients as client}
  <Link 
    type="client"
    id={client.id}
    color={0x83BF00}
    linkNodes={simulation.getNodesByClientId(client.id)}
    isLinkOn={$linkClientOn && (state === "idle" || state === "selected")}
  />
{/each}

{#each $dataset as node (node.id)}
  {#if node.id !== -1}
    <Node 
      id={node.id}
      simulationNode={simulation.getNodeById(node.id)}
      state={state}
    />
  {/if}
{/each}

