<script>
	import { width, height } from '$lib/stores/canvas';
  import { onMount } from 'svelte'
  import * as PIXI from "pixi.js"

  export let app

  let canvas

  

  onMount(() => {
    app = new PIXI.Application({ 
      roundPixels: true,
      view: canvas, 
      resizeTo: window, 
      backgroundColor: 0xE9FAFE,
    })

    app.stage.name = "stage"

    globalThis.__PIXI_APP__ = app

    PIXI.Assets.add({ alias: 'petal', src: '/petal.png'})
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
