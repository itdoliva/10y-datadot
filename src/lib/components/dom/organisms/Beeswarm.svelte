<script>
  // Libraries
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import textures from "textures";

  // Stores
  import { categoriesEnriched, nodeSize, lineWidth } from "$lib/stores/nodes";

  // DOM Components
  import ClearFilterButton from "$lib/components/dom/molecules/ClearFilterButton.svelte";
  import BSBubble from "$lib/components/dom/atoms/BSBubble.svelte";

  export let selected = []
  export let disabled

  let w
  let h

  let svg
  let simulationNodes

  const texture = textures
    .circles()
    .size($nodeSize/2)
    .radius($lineWidth)
    .complement()
    .fill("#818afa")

  const forceCollide = d3.forceCollide().strength(.6)

  const simulation = d3.forceSimulation()
    .alphaTarget(0.3) // stay hot
    .velocityDecay(0.25) // low friction
    .force("center", d3.forceCenter(0, 0))
    .force("charge", d3.forceManyBody().strength(30))
    .force("collide", forceCollide)
  

  $: areaScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 20000 * ($nodeSize/10)])

  $: rScale = (v) => Math.sqrt(areaScale(v)/(2*Math.PI)) + 5

  $: collideRadius = (d) => rScale(d.pctNodes) + 5

  $: forceCollide.radius(collideRadius)



  onMount(() => {
    d3.select(svg)
      .call(texture)

    simulationNodes = $categoriesEnriched.filter(d => d.type === "industry").map((d, i, arr) => ({
      ...d,
      x: getRandomAxisPosition(i, arr.length, w),
      y: getRandomAxisPosition(i, arr.length, h),
      r: rScale(d.pctNodes),
    }))

    simulation
      .nodes(simulationNodes)
      .on("tick", () => simulationNodes = [...simulationNodes])

    forceCollide.radius(collideRadius)

  })

  $: if (simulationNodes) {
    $categoriesEnriched.filter(d => d.type === "industry").forEach(industry => {
      const simulationNode = simulationNodes.find(({ id }) => id === industry.id)
      simulationNode.r = rScale(industry.pctNodes)
      simulationNode.x = simulationNode.x
      simulationNode.y = simulationNode.y
      simulationNode.pctNodes = industry.pctNodes
    })

    forceCollide.radius(collideRadius)
  }


  function getRandomAxisPosition(i, nNodes, size) {
    return (size * i/(nNodes-1)) + size * (-.2 + Math.random() * .4)
  }

  
  function toggle(id) {
    if (disabled) return
    
    if (selected.includes(id)) {
      const index = selected.indexOf(id)
      selected.splice(index, 1)
    } 
    else {
      selected.push(id)
    }

    selected = [...selected]

    forceCollide.radius(collideRadius)
  }

  function bringToFront(id) {
    simulationNodes = [
      ...simulationNodes.filter(d => d.id !== id),
      simulationNodes.find(d => d.id === id)
    ]
  }


</script>


<div class="container beeswarm">
  <div class="svg-wrapper" bind:clientWidth={w} bind:clientHeight={h}>
    <svg bind:this={svg}>
      {#if w && h && simulationNodes}

        <defs>
          <filter x="0" y="0" width="1" height="1" id="text-bg">
            <feFlood flood-color="var(--clr-accent-low)" result="bg" />
            <feMerge>
              <feMergeNode in="bg"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g class="chart" transform="translate({w/2}, {h/2})">
          {#each simulationNodes as { id, x, y, r, pctNodes, alias }, i (id)}
          {@const fill = texture.url()}
          {@const active = selected.includes(id)}
          {@const tweenDelay = i * 15}
            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <g 
              on:mouseover={() => bringToFront(id)}
              on:click={() => toggle(id)}
            >
              <BSBubble {x} {y} {r} {tweenDelay} percentage={pctNodes} alias={"category." + id} {fill} {active} />
            </g>
            {/each}
          </g>
        {/if}
      </svg>
  </div>

  <ClearFilterButton 
    onClick={() => selected = []} 
    disabled={selected.length === 0} 
  />
</div>

<style lang="scss">
  .container {
    aspect-ratio: .91;
    display: grid;
    grid-template-rows: 1fr min-content;
  }

  .svg-wrapper {
    width: 100%;
    height: 100%;
  }

  svg {
    overflow: visible;
    width: 100%;
    height: 100%;

    position: relative;
  }
</style>