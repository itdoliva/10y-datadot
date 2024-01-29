<script>
  import { onMount } from "svelte";
  import * as d3 from "d3"
  import CheckIcon from "$lib/components/atoms/CheckIcon.svelte";

  export let min
  export let max
  export let step = 1
  export let selected = [ min, max ]

  const drag = [ min, max ]

  let svg
  let w
  let h
  let isBehaviourSet = false
  let hovered = false

  const handlerR = 4
  const pad = { left: 8, right: 8 }
  const years = d3.range(min, max+step, step)

  const dragBehaviour = d3.drag()
    .on('drag', dragged)
    .on('end', dragEnd)

  $: {
    if (svg && !isBehaviourSet) {
      d3.select(svg)
        .selectAll('g.handlers .handler-wrapper')
        .call(dragBehaviour)
    }
  }

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
    if (i === 0) {
      drag[i] = Math.min(newYear, drag[1])
    } else {
      drag[i] = Math.max(newYear, drag[0])
    }
  }

  function dragEnd() {
    selected = drag
  }

</script>


<div class="slider-wrapper" bind:clientWidth={w} bind:clientHeight={h}>
  {#if w > 100}
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
            x1={year2pos(drag[0])} 
            x2={year2pos(drag[1])} 
            stroke="darkgrey"
          />
        </g>

        <g class="handlers">

          {#each drag as year, i}

          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <g 
            class="handler-wrapper"
            class:unclickable={i === 1 && drag[0] === max}
            transform="translate({year2pos(year)}, 0)"
            data-index={i}
            on:mouseenter={() => hovered = i}
            on:mouseleave={() => hovered = false}
          >
            <g 
              class="handler"
            >
              <circle
                class="main"
                fill={hovered === i ? '#8D95FB' : i === 0 ? "transparent" : "black"}
                stroke="black"
                stroke-width=1
                r={(10-2*1)/2}
              />

              {#if hovered !== i}
                <circle
                  class="inner"
                  r=1 
                  fill={i === 0 ? "black" : "white"}
                />
              {/if}

              <rect 
                x={-year2pos.step()/2}
                width={year2pos.step()}
                y={-h/2}
                height={h}
                fill="transparent"
              />
            </g>

            <g 
              class="label"
              transform="translate(0, {-handlerR*2.5})"
              text-anchor="middle"
            >
              <text
              >
                {year}
              </text>
            </g>
          </g>

          {/each}
        </g>

      </g>
    </svg>
  {/if}
</div>


<style lang="scss">
  .slider-wrapper {
    height: 2rem;
  }
  svg {
    width: 100%;
    height: 100%;

    overflow: visible;
  }

  .label {
    font-size: 9px;
    font-weight: 600;


    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }


  .unclickable {
    pointer-events: none;
  }
  
</style>