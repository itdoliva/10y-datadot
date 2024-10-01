<script>
  import * as d3 from "d3";
  import { tweened } from "svelte/motion";

  export let number
  export let isPct = false
  export let options = {}

  const defaultOptions = {
    duration: 500,
    easing: d3.easeCubicInOut
  }

  const tweenOptions = {
    ...defaultOptions,
    ...options
  }

  const number_t = tweened(0, tweenOptions)

  $: $number_t = number

</script>

<p class="text-xxs m-0">
  {isPct 
    ? Math.round($number_t*100) + "%" 
    : Math.round($number_t)}
</p>