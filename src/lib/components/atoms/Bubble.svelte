<script>
  import * as d3 from "d3";
	import { tweened } from 'svelte/motion';
  import { getContext } from "svelte";
  import { app } from "$lib/store/canvas";

  export let id
  export let r

  const rTween = tweened(0, { ease: d3.easeCubicInOut })

  const graphics = getContext("graphics")

  $: $rTween = r

  $app.ticker.add(() => {
    graphics.clear()
    graphics.beginFill(0xDCDEFE)
    graphics.drawCircle(0, 0, $rTween)
    graphics.endFill()
  })
</script>