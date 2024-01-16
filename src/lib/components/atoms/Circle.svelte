<script>
  import { tweened } from "svelte/motion";
  import * as d3 from "d3"

  export let fill = 'black'

  export let number
  export let domain = [0, 1]
  export let range = [0, 24]
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

  const r = tweened(undefined, tweenOptions)

  $: rScale = d3.scaleLinear()
    .domain(domain)
    .range(range)

  $: $r = rScale(number)

</script>


<div 
  class="circle-container"
  bind:clientWidth={w}
  bind:clientHeight={h}
>
  <svg
    style:--fill={fill}
  >
    <circle
      cx={w/2}
      cy={h/2}
      r={$r}
    />
  </svg>
</div>


<style lang="scss">
  .circle-container {
    width: 100%;
    height: 100%;

    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  }

  circle {
    fill: var(--fill);
  }
</style>