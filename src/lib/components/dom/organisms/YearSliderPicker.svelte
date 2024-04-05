<script>
  // Libraries
  import * as d3 from "d3"
  import { onMount } from "svelte"

  export let min
  export let max
  export let step = 1
  export let selected = [ min, max ]
  export let disabled

  const drag = [ min, max ]

  let svg
  let w = 100
  let h = 100
  let isBehaviourSet = false

  const pad = { left: 8, right: 8 }
  const years = d3.range(min, max+step, step)

  // Reactivity
  $: rCircle = h/4
  $: innerW = w - (pad.left + pad.right)
  
  $: year2pos = d3.scalePoint()
    .domain(years)
    .range([0, innerW])

  $: pos2year = d3.scaleQuantize()
    .domain([0, innerW])
    .range(years)

  $: if (svg && !isBehaviourSet) {
    const dragBehaviour = d3.drag()
      .on('drag', dragged)
      .on('end', dragEnd)

    d3.select(svg)
      .selectAll('.slider__handlers > .handler')
      .call(dragBehaviour)

      isBehaviourSet = true
  }

  $: {
    // When selected changes, updates drag
    // This is particularly useful when changes to selected are made outside the component
    drag[0] = selected[0]
    drag[1] = selected[1]
  }

  function dragged(e) {
    if (disabled) return

    const i = +this.getAttribute('data-index')
    const newYear = pos2year(e.x)
    if (i === 0) {
      drag[i] = Math.min(newYear, drag[1])
    } 
    else {
      drag[i] = Math.max(newYear, drag[0])
    }
  }

  function dragEnd() {
    if (disabled) return
    selected = drag
  }


</script>


<div class="container" >

  <ul class="labels">
    {#each drag as year}
    {@const x = year2pos(year) + pad.left }
      <p class="label" style:left="{x}px">
        {year}
      </p>
    {/each}
  </ul>

  <div 
    class="slider-container"
    bind:clientWidth={w} 
    bind:clientHeight={h}
  >
    <svg class="slider" bind:this={svg}>

      <g transform="translate({pad.left}, {h/2})">

        <g class="slider__lines">
          <line class="back-line" x1=0 x2={innerW} />
          <line class="front-line" x1={year2pos(drag[0])} x2={year2pos(drag[1])} />
        </g>

        <g class="slider__handlers">

          {#each drag as year, i}
          {@const x = year2pos(year) }
          {@const unclickable = i === 1 && drag[0] === max }
          
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <g 
              class="handler" 
              class:unclickable={unclickable}
              transform="translate({x}, 0)"
              data-index={i}
            >

              <circle class="outer-circle" r={rCircle} />
              <circle class="inner-circle" r={rCircle/4} />

              <rect 
                class="hover-box"
                x={-year2pos.step()/2}
                y={-h/2}
                width={year2pos.step()}
                height={h}
              />
            </g>

          {/each}

        </g>

      </g>
    </svg>
  </div>

</div>


<style lang="scss">
  .container {
    --fs-year-label: calc(var(--fs-label)*.9);

    display: grid;

    grid-auto-flow: row;

    .labels {
      height: var(--fs-year-label);

      position: relative;

      font-size: calc(var(--fs-label)*.9);
      font-weight: 600;

      .label {
        position: absolute;
        pointer-events: none;
        transform: translate(-50%, 0);
      }

    }

    .slider-container {
      height: calc(2*var(--fs-label));

      .slider {
        width: 100%;
        height: 100%;

        overflow: visible;

        &__lines {
          .back-line {
            stroke: var(--clr-black);
            stroke-dasharray: 1 3;
          }

          .front-line {
            stroke: var(--clr-black);
          }
        }

        &__handlers {

          .handler {

            .outer-circle {
              stroke: var(--clr-black);
              stroke-width: 1px;
            }

            .inner-circle {
              opacity: 0;
            }

            .hover-box {
              fill: transparent;
            }

            &:first-child {
              .outer-circle {
                fill: transparent;
              }

              .inner-circle {
                fill: var(--clr-black);
              }
            }

            &:last-child {
              .outer-circle {
                fill: var(--clr-black);
              }

              .inner-circle {
                fill: var(--clr-white);
              }
            }

            &:hover {
              .outer-circle {
                fill: var(--clr-accent-hover) !important;
              }
            }

            &:not(:hover) {
              .inner-circle {
                opacity: 1;
              }
            }
          }

        }
      }
    }
  }

  .unclickable {
    pointer-events: none;
  }
  
</style>