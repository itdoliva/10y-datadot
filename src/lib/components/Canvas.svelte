<script>
  import { width, height, pixelRatio } from "$lib/store/canvas"
  import { onMount, setContext, getContext } from 'svelte'

  export let key
  export let composition = 'source-over'
  export let mixBlendMode = 'normal'

  const toDraw = []

  let canvas
  let ctx

  const { addCanvasContext } = getContext('layout')

  onMount(() => {
    ctx = canvas.getContext('2d')

    addCanvasContext(key, { 
      ctx, 
      add: fn => toDraw.push(fn), 
      remove: fn => {
        const index = toDraw.indexOf(fn)
        if (index > -1) {
          toDraw.splice(index, 1)
        }
      }
    })

    resize()
    render()
  })


  function resize() {
    canvas.setAttribute('width', $width * $pixelRatio)
    canvas.setAttribute('height', $height * $pixelRatio)
    canvas.style.width = $width + 'px'
    canvas.style.height = $height + 'px'

    ctx.resetTransform()
    ctx.scale($pixelRatio, $pixelRatio)

    ctx.globalCompositeOperation = composition
  }


  function render() {
    requestAnimationFrame(render)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    toDraw.forEach(fn => fn(ctx))
  }

</script>

<svelte:window on:resize={resize}/>
<canvas 
  class={key} 
  style:mix-blend-mode={mixBlendMode}
  bind:this={canvas} 
/>
<slot />

<style>
  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>