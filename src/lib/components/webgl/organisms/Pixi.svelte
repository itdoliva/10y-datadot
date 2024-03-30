<script>
	import { width, height } from '$lib/stores/canvas';
  import { onMount } from 'svelte'
  import * as PIXI from "pixi.js"
  import BackgroundVertex from "$lib/bg.vert?raw";
  import BackgroundFragment from "$lib/bg.frag?raw";

  export let app

  let canvas

  const bgFilter = new PIXI.Filter(BackgroundVertex, BackgroundFragment, {
    iTime: 0.0,
    iRatio: 1.0,
  })

  const meshGradient = new PIXI.Graphics()
  meshGradient.filters = [ bgFilter ]


  onMount(() => {
    app = new PIXI.Application({ 
      roundPixels: true,
      view: canvas, 
      resizeTo: window, 
      backgroundColor: 0xFFFFFF
    })

    app.stage.name = "stage"

    globalThis.__PIXI_APP__ = app

    PIXI.Assets.add({ alias: 'petal', src: '/petal.png'})

    app.stage.addChild(meshGradient)

    app.ticker.add((delta) => {
      bgFilter.uniforms.iTime += .025 * delta;
      bgFilter.uniforms.iRatio = app.screen.width / app.screen.height;

      meshGradient.clear()
      meshGradient.beginFill(0xFFFFFF)
      meshGradient.drawRect(0, 0, app.screen.width, app.screen.height)
      meshGradient.endFill()
    });
  })

</script>

<canvas 
  bind:this={canvas} 
  style:width={$width + 'px'}
  style:height={$height + 'px'}
/>

<style>
  canvas {
    position: absolute;
    left: 0;
    top: 0;

    z-index: 0;
  }
</style>
