<script>
  import * as d3 from "d3"
  import { tweened } from "svelte/motion";

  export let percentage
  export let i = 0
  
  let w = 0
  let h = 0

  const options = {
    duration: 500,
    easing: d3.easeCubicInOut,
    delay: i*50
  }

  const pct = tweened(0, options)
  const barW = tweened(0, options)

  $: xScale = d3.scaleLinear().range([0, w])
  $: $barW = xScale(percentage)
  $: $pct = percentage


</script>

<div class="wrapper">

  <div 
    class="bar-container"
    bind:clientWidth={w}
    bind:clientHeight={h}
  >
    <svg>
      <line x1=0 x2={w} y1={h/2} y2={h/2} stroke="black" stroke-dasharray="1 3"/>
      <line x1=0 x2={$barW} y1={h/2} y2={h/2} stroke="var(--color-accent)" stroke-width=2/>
    </svg>
  </div>

  <div class="text-container">
    <p>
      {Math.round($pct*100)}%
    </p>
  </div>

</div>

<style lang="scss">
  .wrapper {
    width: 100%;
    height: 1em;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: .6em;

    .bar-container {
      height: 100%;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .text-container {
      width: 5.25em;
      transform: translate(0, -.65em);

      p {
        margin: 0;
        text-align: right;
      }
    }

  }

</style>