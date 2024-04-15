<script>
  // Libraries
  import { onMount } from 'svelte'
  import * as PIXI from "pixi.js"
  
  // Stores
	import { width, height } from '$lib/stores/canvas';

  // Raw files
  import BackgroundVertex from "$lib/bg.vert?raw";
  import BackgroundFragment from "$lib/bg.frag?raw";

  export let app

  let canvas

  onMount(() => {
    app = globalThis.__PIXI_APP__ = new PIXI.Application({ 
      roundPixels: true,
      view: canvas, 
      resizeTo: window, 
      backgroundColor: 0xFFFFFF
    })

    initMesh()
    initAssets()
  })

  function initMesh() {
    const bgFilter = new PIXI.Filter(BackgroundVertex, BackgroundFragment, {
      iTime: 0.0,
      iRatio: 1.0,
    })

    const meshGradient = new PIXI.Graphics()
    meshGradient.filters = [ bgFilter ]

    app.stage.addChild(meshGradient)

    app.ticker.add((delta) => {
      bgFilter.uniforms.iTime += .025 * delta;
      bgFilter.uniforms.iRatio = app.screen.width / app.screen.height;

      meshGradient.clear()
      meshGradient.beginFill(0xFFFFFF)
      meshGradient.drawRect(0, 0, app.screen.width, app.screen.height)
      meshGradient.endFill()
    });
  }

  function initAssets() {
    PIXI.Assets.add({ alias: 'petal', src: '/petal.png'})
  }

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

    z-index: -1;
  }
</style>
