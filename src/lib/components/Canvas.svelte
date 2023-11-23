<script>
  import { width, height, pixelRatio } from "$lib/store/canvas"
  import { onMount, setContext } from 'svelte';
  
  const toDraw = []
  let canvas
  let ctx

  onMount(() => {
    ctx = canvas.getContext('2d')
    render()
  })

  setContext('canvas', {
    add: fn => toDraw.push(fn),
    remove: fn => {
      const index = toDraw.indexOf(fn)
      if (index > -1) {
        toDraw.splice(index, 1)
      }
    } 
  })


  function render() {
    requestAnimationFrame(render)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    toDraw.forEach(fn => fn(ctx))
  }

</script>

<canvas 
  bind:this={canvas}
  width={$width * $pixelRatio}
  height={$height * $pixelRatio}
  style:width="{$width}px"
  style:height="{$height}px"
/>
<slot />