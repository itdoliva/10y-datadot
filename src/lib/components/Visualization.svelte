<script>
  import { onMount, setContext } from 'svelte'
	import castContainer from '$lib/actions/castContainer';
  import * as PIXI from "pixi.js"
  import * as d3 from "d3";
  
  
  import { app, width, height, figureWidth, figureHeight }  from '$lib/stores/canvas';
  import { cameraOffset, cameraOffsetX, cameraOffsetY, zoomBehaviour, zoom } from "$lib/stores/zoom";

  const root = new PIXI.Container()
  const scene = new PIXI.Container()
  root.name = "viz"
  scene.name = "scene"
  
  root.addChild(scene)

  $: scene.x = $figureWidth/2 + $cameraOffsetX
  $: scene.y = $figureHeight/2 + $cameraOffsetY
  $: scene.scale.set($zoom)

  onMount(() => {
    d3.select($app.view)
      .call(zoomBehaviour)
      .on("wheel", e => {
        console.log(zoomBehaviour)
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
      .call(zoomBehaviour.transform, d3.zoomIdentity)
  }

</script>

<div 
  class="container"
  bind:clientWidth={$figureWidth}
  bind:clientHeight={$figureHeight}
  use:castContainer={{ context: root, hasMask: true, centered: false }}
/>
<slot/>


<style>
  .container {
    width: 100%;
    height: 100%;
  }
</style>