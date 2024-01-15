<script>
	import { figureWidth, figureHeight } from '$lib/store/canvas';
  import { onMount, getContext, setContext } from 'svelte'
  import * as PIXI from "pixi.js"
  import * as d3 from "d3";
  import { zoomBehaviour } from "$lib/store/zoom";
  import { cameraOffsetX, cameraOffsetY, zoom } from "$lib/store/zoom";

  
  const { wrapper } = getContext('layout')

  const root = new PIXI.Container()
  root.name = "Root"

  const tickerCallbacks = []

  let app
  let canvas

  $: root.x = $cameraOffsetX + $figureWidth/2
  $: root.y = $cameraOffsetY + $figureHeight/2
  $: root.scale.set($zoom)


  onMount(() => {
    app = new PIXI.Application({ 
      roundPixels: true,
      view: canvas, 
      resizeTo: wrapper, 
      backgroundColor: 0xffffff,
    })

    app.stage.name = "Stage"

    app.stage.addChild(root)

    d3.select(canvas)
      .call(zoomBehaviour)
      .on("wheel", e => e.preventDefault())

    globalThis.__PIXI_APP__ = app

    PIXI.Assets.add({ alias: 'petal', src: '/petal.png' })

    tickerCallbacks.forEach(cb => app.ticker.add(cb))
  })


  setContext('pixi', { 
    stage: root,
    addTickerCallback: (cb) => {
      tickerCallbacks.push(cb)
    }
   })

</script>

<canvas 
  bind:this={canvas} 
  style:width={$figureWidth + 'px'}
  style:height={$figureHeight + 'px'}
/>
<slot />
