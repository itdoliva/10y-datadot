<script>
  import { getContext, onDestroy, onMount } from "svelte";
  import { nodeSize } from "$lib/store/canvas"

  export let x = 0
  export let y = 0

  const canvasContext = getContext("canvas")

  onMount(() => canvasContext.add(draw))
  onDestroy(() => canvasContext.remove(draw))


  function draw(ctx) {
    ctx.fillStyle = 'black'
    ctx.fillRect(x - $nodeSize/2, y - $nodeSize/2, $nodeSize, $nodeSize)
  }

</script>