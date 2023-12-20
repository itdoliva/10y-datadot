<script>
  import { onMount } from "svelte";
  import * as d3 from "d3"

  export let min
  export let max
  export let step = 1
  export let selected = [ min, max ]


  let svg
  let w
  let h

  const pad = { left: 20, right: 20 }
  const years = d3.range(min, max+step, step)
  const handlerR = 4

  const dragBehaviour = d3.drag()
    .on('drag', dragged)


  onMount(() => {
    d3.select(svg)
      .selectAll('g.handlers .handler')
      .call(dragBehaviour)
  })

  $: innerW = w - (pad.left + pad.right)

  $: year2pos = d3.scalePoint()
    .domain(years)
    .range([0, innerW])

  $: pos2year = d3.scaleQuantize()
    .domain([0, innerW])
    .range(years)

  function dragged(e) {
    const i = +this.getAttribute('data-index')
    const newYear = pos2year(e.x)
    selected[i] = i === 0 
      ? Math.min(newYear, selected[1])
      : Math.max(newYear, selected[0])
  }

</script>


<div class="slider-wrapper" bind:clientWidth={w} bind:clientHeight={h}>
  <svg bind:this={svg}>
    <g class="slider" transform="translate({pad.left}, {h/2})">

      <!-- Dashed Line -->
      <g class="lines">
        <line 
          x1=0 
          x2={innerW} 
          stroke="black" 
          stroke-dasharray="1 3"
        />
  
        <line 
          x1={year2pos(selected[0])} 
          x2={year2pos(selected[1])} 
          stroke="darkgrey"
        />
      </g>

      <g class="handlers">
        
        {#each selected as year, i}
          <g
            class="handler"
            class:unclickable={i === 1 && selected[0] === max}
            transform="translate({year2pos(year)}, 0)"
            data-index={i}
          >
            <circle 
              r={handlerR*3} 
              fill="transparent"
            />

            <circle 
              r={handlerR} 
              fill={i === 0 ? "white" : 'black'}
              stroke="black"
            />

            <circle 
              r={handlerR*.2} 
              fill={i === 0 ? "black" : 'white'}
            />
          </g>
        {/each}
      </g>

      <g 
        class="labels unclickable"
        transform="translate(0, {-handlerR*2.5})"
      >
        {#each selected as year, i}
          <text
            font-size=9
            font-weight=600
            transform="translate({year2pos(year)}, 0)"
            text-anchor="middle"
          >
            {year}
          </text>
  
        {/each}
      </g>


    </g>
  </svg>
</div>


<style>
  svg {
    width: 100%;
    height: 100%;
  }

  .handler {
  }

  .unclickable {
    pointer-events: none;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }
  
</style>