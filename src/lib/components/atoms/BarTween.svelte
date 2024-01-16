<script>
  import * as d3 from "d3"
  import { tweened } from "svelte/motion";

  export let number
  export let domain = [0, 1]
  export let options = {}
  
  let w = 0
  let h = 0

  const defaultOptions = {
    duration: 500,
    easing: d3.easeCubicInOut
  }

  const tweenOptions = {
    ...defaultOptions,
    ...options
  }

  const bw = tweened(0, tweenOptions)

  $: xScale = d3.scaleLinear()
    .domain(domain)
    .range([0, w])

  $: $bw = xScale(number)


</script>


<div 
  class="bar-container"
  bind:clientWidth={w}
  bind:clientHeight={h}
>
  <svg>
    <line x1=0 x2={w} y1={h/2} y2={h/2} stroke="black" stroke-dasharray="1 3"/>
    <line x1=0 x2={$bw} y1={h/2} y2={h/2} stroke="var(--color-accent)" stroke-width=2/>
  </svg>
</div>


<style lang="scss">
  .bar-container {
    width: 100%;
    height: 1em;

    svg {
      width: 100%;
      height: 100%;
    }
  }


</style>