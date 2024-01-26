<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { gsap } from "gsap";
  import textures from "textures";

  import Button from "$lib/components/atoms/Button.svelte";
  import BSBubble from "$lib/components/atoms/BSBubble.svelte";

  export let categories
  export let selected = []

  let w
  let h

  let svg
  
  let initialized = false
  let tick = 0
  let simulationNodes
  
  const tl = gsap.timeline()

  const area = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 20000])
  
  const simulation = d3.forceSimulation()
    .force("center", d3.forceCenter(0, 0))
    .force("charge", d3.forceManyBody().strength(30))
    .force("collide", d3.forceCollide(d => r(d.pctNodes) + 5).strength(1))
    .force('forceX', d3.forceX(d => d.x).strength(1))
    .force('forceY', d3.forceY(() => h/2).strength(0.01))
    .on("tick", ticked)

  const texture = textures
    .circles()
    .size(10)
    .radius(1)
    .complement()
    .fill("#818afa")

  onMount(() => {
    d3.select(svg)
      .call(texture)
  })

  $: x = d3.scalePoint()
    .domain(categories.map(d => d.id))
    .range([-w/2, w/2])
    .padding(.5)  


  $: if (categories) {
    tick += .01

    simulationNodes = makeSimulationNodes()
    simulationNodes.tick = tick
    simulation.nodes(simulationNodes)

    if (initialized) {
      tl.clear()
      tl.add(() => simulation.alphaTarget(0).alphaTarget(.3).restart())
      tl.add(() => simulation.alphaTarget(0), 2000)
    } else {
      initialized = true
    }
  }

  function r(v) {
    return Math.sqrt(area(v)/(2*Math.PI))
  }
  
  function makeSimulationNodes() {
    const currentNodes = simulation.nodes()

    const simulationNodes = categories.map(d => {
      const current = currentNodes.find(n => n.id === d.id)
      return {
        ...d,
        x: current ? current.x : x(d.id), 
        y: current ? current.y : -(h/2) + Math.random() * h
      }
    })

    return simulationNodes
  }

  function ticked() {
    tick += .01
  }

  function toggle(id) {
    if (selected.includes(id)) {
      const index = selected.indexOf(id)
      selected.splice(index, 1)
    } else {
      selected.push(id)
    }
    selected = [...selected]
  }


</script>


<div class="beeswarm-wrapper" bind:clientWidth={w} bind:clientHeight={h}>
  <svg bind:this={svg}>

    <defs>
      <filter x="0" y="0" width="1" height="1" id="text-bg">
        <feFlood flood-color="#CEFC6E" result="bg" />
        <feMerge>
          <feMergeNode in="bg"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {#if w && h}
      <g class="chart" transform="translate({w/2}, {h/2})">
          {#each simulationNodes as { x, y, pctNodes, id, alias } (id)}
            <BSBubble 
              x={x} 
              y={y} 
              r={r(pctNodes)} 
              pct={pctNodes}
              label={alias}
              fill={texture.url()}
              active={selected.includes(id)}
              onClick={() => toggle(id)}
            />
          {/each}
      </g>
    {/if}
  </svg>

  <Button onClick={() => selected = []} disabled={selected.length === 0}>
    Selecionar tudo
  </Button>
</div>

<style lang="scss">
  .beeswarm-wrapper {
    aspect-ratio: 1.71;
  }

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
</style>