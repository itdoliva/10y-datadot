<script>
  import * as d3 from "d3";
  import { getContext, onDestroy } from "svelte";
  import { app } from "$lib/stores/canvas";
  import { gsap } from "gsap";

  export let i
  export let r

  const graphics = getContext("graphics")

  const bubble = { r }

  const tweenOptions = {
    duration: 1,
    delay: i * .05,
    ease: d3.easeCubicInOut
  }

  $: gsap.to(bubble, { r: r, ...tweenOptions })

  function ticked() {
    graphics.clear()
    graphics.beginFill(0xDCDEFE)
    graphics.drawCircle(0, 0, bubble.r)
    graphics.endFill()
  }

  const ticker = $app.ticker.add(ticked)

  onDestroy(() => {
    ticker.remove(ticked)
  })
</script>