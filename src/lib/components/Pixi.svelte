<script>
	import { figureWidth, figureHeight } from '$lib/store/canvas';
  import { onMount, getContext, setContext } from 'svelte'
  import * as PIXI from "pixi.js"
  import * as d3 from "d3";
  import { zoomBehaviour } from "$lib/store/zoom";
  import { cameraOffsetX, cameraOffsetY, zoom } from "$lib/store/zoom";

  export let backgroundColor = 0xffffff
  
  const { wrapper, padding } = getContext('layout')

  const outer = new PIXI.Container() // Outer container applies zoom and paning
  const inner = new PIXI.Container() // Inner container applies padding

  outer.addChild(inner)
  

  let app
  let canvas

  $: outer.x = $cameraOffsetX
  $: outer.y = $cameraOffsetY
  $: outer.scale.set($zoom)

  $: inner.x = $padding.left
  $: inner.y = $padding.top


  onMount(() => {
    app = new PIXI.Application({ 
      renderer: PIXI.renderer,
      view: canvas, 
      resizeTo: wrapper, 
      backgroundColor 
    })

    const fpsText = new PIXI.Text('0fps', { fontSize: 12, fill: 0xFF0000 })
    fpsText.x = 6
    fpsText.y = 6

    app.ticker.add((delta) => {
      const fps = Math.round(PIXI.Ticker.shared.FPS)
      fpsText.text = `${fps}fps`
    })

    app.stage.addChild(fpsText)
    app.stage.addChild(outer)

    d3.select(canvas)
      .call(zoomBehaviour)
      .on("wheel", event => event.preventDefault())

    globalThis.__PIXI_APP__ = app
  })

  

  setContext('pixi', { container: inner })

</script>

<canvas 
  bind:this={canvas} 
  style:width={$figureWidth + 'px'}
  style:height={$figureHeight + 'px'}
/>
<slot />
