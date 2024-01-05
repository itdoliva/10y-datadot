<script>
	import { figureWidth, figureHeight } from '$lib/store/canvas';
  import { onMount, getContext, setContext } from 'svelte'
  import * as PIXI from "pixi.js"

  export let backgroundColor = 0xffffff
  
  const { wrapper, padding } = getContext('layout')

  const container = new PIXI.Container()
  

  let app
  let canvas

  $: container.x = $padding.left
  $: container.y = $padding.top

  onMount(() => {
    app = new PIXI.Application({ 
      renderer: PIXI.renderer,
      view: canvas, 
      resizeTo: wrapper, 
      backgroundColor 
    })

    const fpsText = new PIXI.Text('FPS: 0', { fill: 0xFF0000 })

    app.ticker.add((delta) => {
      const fps = Math.round(PIXI.Ticker.shared.FPS)
      fpsText.text = `FPS: ${fps}`
    })

    globalThis.__PIXI_APP__ = app

    app.stage.addChild(fpsText)
    app.stage.addChild(container)
  })

  setContext('pixi', { container })

</script>

<canvas 
  bind:this={canvas} 
  style:width={$figureWidth + 'px'}
  style:height={$figureHeight + 'px'}
/>
<slot />
