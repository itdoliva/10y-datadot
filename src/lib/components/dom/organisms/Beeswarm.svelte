<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import textures from "textures";

  import { categories, categoriesEnriched } from "$lib/stores/nodes";

  import Button from "$lib/components/dom/atoms/Button.svelte";
  import BSBubble from "$lib/components/dom/atoms/BSBubble.svelte";

  export let selected = []
  export let disabled

  let w
  let h

  let svg
  let simulationNodes

  const texture = textures
    .circles()
    .size(10)
    .radius(1)
    .complement()
    .fill("#818afa")


  const areaScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 20000])

  const rScale = (v) => {
    return Math.sqrt(areaScale(v)/(2*Math.PI)) + 5
  }
    
  const collideRadius = (d) => {
    return rScale(d.pctNodes) + 5
  }

  const forceCollide = d3.forceCollide()
    .radius(collideRadius)
    .strength(.6)


  onMount(() => {
    d3.select(svg)
      .call(texture)

    simulationNodes = $categoriesEnriched.industries.map((d, i, arr) => ({
      ...d,
      x: (w * i/(arr.length-1)) + w * (-.2 + Math.random()*.4), 
      y: (h * i/(arr.length-1)) + h * (-.2 + Math.random()*.4),
      r: rScale(d.pctNodes),
    }))

    simulationNodes.tick = 0

    d3.forceSimulation()
      .alphaTarget(0.3) // stay hot
      .velocityDecay(0.25) // low friction
      .force("center", d3.forceCenter(0, 0))
      .force("charge", d3.forceManyBody().strength(30))
      .force("collide", forceCollide)
      .nodes(simulationNodes)
      .on("tick", () => {
        simulationNodes.tick += .0001
        simulationNodes = [...simulationNodes]
      })

    forceCollide.radius(collideRadius)

  })

  $: if ($categoriesEnriched.industries && simulationNodes) {
    $categoriesEnriched.industries.forEach(industry => {
      const simulationNode = simulationNodes.find(({ id }) => id === industry.id)
      simulationNode.r = rScale(industry.pctNodes)
      simulationNode.x = simulationNode.x
      simulationNode.y = simulationNode.y
      simulationNode.pctNodes = industry.pctNodes
    })

    simulationNodes.tick += .001

    forceCollide.radius(collideRadius)
  }

  
  function toggle(id) {
    if (disabled) {
      return
    }
    
    if (selected.includes(id)) {
      const index = selected.indexOf(id)
      selected.splice(index, 1)
    } else {
      selected.push(id)
    }
    selected = [...selected]

    forceCollide.radius(collideRadius)
  }

  function sortNodes(id) {
    simulationNodes = [
      ...simulationNodes.filter(d => d.id !== id),
      simulationNodes.find(d => d.id === id)
    ]
  }


</script>


<div class="beeswarm-wrapper">
  <div class="svg-wrapper" bind:clientWidth={w} bind:clientHeight={h}>
    <svg bind:this={svg}>
      {#if w && h}

        <defs>
          <filter x="0" y="0" width="1" height="1" id="text-bg">
            <feFlood flood-color="#CEFC6E" result="bg" />
            <feMerge>
              <feMergeNode in="bg"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g class="chart" transform="translate({w/2}, {h/2})">
          {#each simulationNodes as { x, y, r, pctNodes, id, alias } (id)}
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <g on:mouseover={() => sortNodes(id)}>
            <BSBubble 
              x={x} 
              y={y} 
              r={r} 
              pct={pctNodes}
              label={alias}
              fill={texture.url()}
              active={selected.includes(id)}
              onClick={() => toggle(id)}
            />
          </g>
          {/each}
        </g>
        {/if}
      </svg>
  </div>

  <Button onClick={() => selected = []} disabled={selected.length === 0}>
    selecionar tudo
  </Button>
</div>

<style lang="scss">
  .beeswarm-wrapper {
    aspect-ratio: 1.71;

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