<script>
  import { width, height, pixelRatio, cameraOffset, zoom } from "$lib/store/canvas"
  import { onMount, getContext } from 'svelte'

  export let key
  export let composition = 'source-over'
  export let mixBlendMode = 'normal'

  const toDraw = []

  let canvas
  let ctx

  const { addCanvasContext } = getContext('layout')

  onMount(() => {
    ctx = canvas.getContext('2d')

    ctx.stroke_ = stroke
    ctx.fill_ = fill
    ctx.linkEdges = linkEdges

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

  function stroke(color='black', width=1) {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.stroke()
  }

  function fill(color='black') {
    ctx.fillStyle = color
    ctx.fill()
  }

  function linkEdges(points, close=true) {
    // Draw a path on the given context
    for (let i=0; i<points.length; i++) {
      const cmd = i === 0 ? 'moveTo' : 'lineTo'
      const [ px, py ] = points[i]
      ctx[cmd](px, py)
    }

    if (close) ctx.closePath()
  }


  function resize() {
    canvas.setAttribute('width', $width * $pixelRatio)
    canvas.setAttribute('height', $height * $pixelRatio)
    canvas.style.width = $width + 'px'
    canvas.style.height = $height + 'px'

    ctx.resetTransform()
    ctx.scale($zoom, $zoom)

    ctx.globalCompositeOperation = composition
  }


  function render() {
    requestAnimationFrame(render)

    ctx.resetTransform()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.translate($cameraOffset.x, $cameraOffset.y)
    ctx.scale($zoom, $zoom)
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