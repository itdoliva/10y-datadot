<script>
  import { onMount, setContext } from 'svelte'
  import * as PIXI from "pixi.js"
  import * as d3 from "d3";
  
  import { width, height, figureWidth, figureHeight }  from '$lib/store/canvas';
  import { cameraOffsetX, cameraOffsetY, zoomBehaviour, zoom } from "$lib/store/zoom";


  export let app

  let container

  const root = new PIXI.Container()
  root.name = "viz"

  const mask = new PIXI.Graphics()
  mask.name = "mask"

  const scene = new PIXI.Container()
  scene.name = "scene"
  
  app.stage.addChild(root, mask)
  
  root.addChild(scene)
  root.mask = mask

  app.ticker.add(() => {
    root.mask.clear()

    root.mask.beginFill(0x000000)
    root.mask.drawRect(0, 0, $figureWidth, $figureHeight)
    root.mask.endFill()
  })

  $: root.x = $width - $figureWidth
  $: root.y = $height - $figureHeight

  $: mask.x = $width - $figureWidth
  $: mask.y = $height - $figureHeight

  $: scene.x = $figureWidth/2 + $cameraOffsetX
  $: scene.y = $figureHeight/2 + $cameraOffsetY
  $: scene.scale.set($zoom)

  onMount(() => {
    d3.select(container)
      .call(zoomBehaviour)
      .on("wheel", e => e.preventDefault())
  })

  setContext('viz', { 
    app, 
    root, 
    scene,
    resetZoom
  })

  function resetZoom(duration=1000) {
    d3.select(container)
      .transition()
      .duration(duration)
      .ease(d3.easeCubicInOut)
      .call(zoomBehaviour.transform, d3.zoomIdentity)
  }

</script>

<div 
  class="container"
  bind:this={container}
  bind:clientWidth={$figureWidth}
  bind:clientHeight={$figureHeight}
/>
<slot/>


<style>
  .container {
    width: 100%;
    height: 100%;
  }
</style>