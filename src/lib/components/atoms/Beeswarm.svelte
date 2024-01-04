<script>
  import * as d3 from "d3"
  import { nodes, nNodes } from '$lib/store/nodes.js';

  export let category
  export let categories
  export let selected = []

  console.log({categories})

  let w
  let h
  let svg

  let simulationNodes

  const radiusScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 140])
  

    const simulation = d3.forceSimulation()
    .force("y", d3.forceY().y(() => h/2))
    .force("x", d3.forceX().x(() => w/2))
    .force("collide", d3.forceCollide().radius(d => radiusScale(d.value) + 4))
    .on("tick", ticked)

  $: updateNodes($nodes)

  
  $: console.log(selected)


  function ticked() {
    simulationNodes = [...simulationNodes]
  }
  

  function updateNodes(nodes) {
    if (!nodes) return

    categories.forEach(({ id, name, alias }) => {
      const value = nodes.filter(d => d.industry === id).length / nodes.length
    })

    simulationNodes = d3.groups(nodes, d => d[category])
      .map(([index, arr]) => ({ index, value: arr.length / $nNodes, x: w ? w/2 : 40, y: h ? h/2 : 40 }))

    simulation.nodes(simulationNodes)
    simulation.alphaTarget(.3).restart()
  }

  function toggle(id) {
    if (selected.includes(id)) {
      const index = selected.indexOf(id)
      selected.splice(index, 1)
    } else {
      selected.push(id)
    }
  }


</script>


<div class="beeswarm-wrapper" bind:clientWidth={w} bind:clientHeight={h}>
  <svg bind:this={svg}>
    {#if w && h}
      <g class="chart">
        {#each simulationNodes as { x, y, value, index } (index)}
          <g 
            class="node"
            transform="translate({x}, {y})"
            on:click={() => toggle(index)}
          >
            <circle 
              r={radiusScale(value)}
            />

            <text
              text-anchor="middle"
              dominant-baseline="middle"
              font-weight=700
            >
              <tspan>{Math.round(value*100)}%</tspan>
            </text>
          </g>
        {/each}
      </g>
    {/if}
  </svg>
</div>

<style lang="scss">
  svg {
    width: 100%;
    height: 100%;
  }

  .node {

    circle {
      stroke: #818afa;
      fill: none;
    }

    text {
      -webkit-user-select: none; /* Safari */
      -ms-user-select: none; /* IE 10 and IE 11 */
      user-select: none; /* Standard syntax */
    }

    &:hover {
      circle {
        fill: #818afa;
      }
    }
  }
</style>