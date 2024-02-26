<script>
  import { onMount, setContext } from 'svelte'
  import * as PIXI from "pixi.js"
  import * as d3 from "d3";
  
  import { app, width, height, figureWidth, figureHeight }  from '$lib/stores/canvas';
  import { cameraOffsetX, cameraOffsetY, zoomBehaviour, zoom } from "$lib/stores/zoom";

  const root = new PIXI.Container()
  root.name = "viz"

  const mask = new PIXI.Graphics()
  mask.name = "mask"

  const scene = new PIXI.Container()
  scene.name = "scene"
  
  $app.stage.addChild(root, mask)
  
  root.addChild(scene)
  root.mask = mask

  $app.ticker.add(() => {
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

  $: if ($figureHeight && $figureWidth) {
    scene.centerPoint = scene.toGlobal(new PIXI.Point(0, 0))
  }

  onMount(() => {
    d3.select($app.view)
      .call(zoomBehaviour)
      .on("wheel", e => {
        e.preventDefault()
      })
  })

  setContext('viz', { 
    root, 
    scene,
    resetZoom
  })

  function resetZoom(duration=1000) {
    d3.select($app.view)
      .transition()
      .duration(duration)
      .ease(d3.easeCubicInOut)
      .call(zoomBehaviour.transform, d3.zoomIdentity)
  }

</script>

<div 
  class="container"
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