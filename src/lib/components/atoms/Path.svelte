<script>
  import { onMount, onDestroy, getContext } from "svelte"

  export let canvas
  export let makePath
  export let fill = undefined
  export let stroke = undefined

  const { canvasContexts } = getContext("layout")

  let canvasContext

  function draw(ctx) {
    makePath(ctx)

    if (fill !== undefined) {
      ctx.fill_(...fill)
    }

    if (stroke !== undefined) {
      ctx.stroke_(...stroke)
    }
  }

  onMount(() => {
    canvasContext = canvasContexts[canvas]
    canvasContext.add(draw)
  })

  onDestroy(() => {
    canvasContext.remove(draw)
  })
</script>