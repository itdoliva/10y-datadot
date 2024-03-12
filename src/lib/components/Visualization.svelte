<script>
  import { onMount, setContext } from 'svelte'
  import * as PIXI from "pixi.js"
  import * as d3 from "d3";
  
	import castContainer from '$lib/actions/castContainer';
  import { app, figureWidth, figureHeight }  from '$lib/stores/canvas';
  import { cameraOffsetX, cameraOffsetY, zoomBehaviour, zoom } from "$lib/stores/zoom";
  import { nodeSize } from "$lib/stores/nodes";

  const root = new PIXI.Container()
  const scene = new PIXI.Container()
  root.name = "viz"
  scene.name = "scene"

  scene.node = {
    hitArea: new PIXI.Rectangle()
  }
  
  root.addChild(scene)

  $: scene.x = $figureWidth/2 + $cameraOffsetX
  $: scene.y = $figureHeight/2 + $cameraOffsetY
  $: scene.scale.set($zoom)

  $: updateNodeHitArea($nodeSize)


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
      .call(zoomBehaviour.transform, d3.zoomIdentity)
  }

  function updateNodeHitArea(nodeSize) {
    scene.node.hitArea.x = -nodeSize/2
    scene.node.hitArea.y = -nodeSize/2
    scene.node.hitArea.width = nodeSize
    scene.node.hitArea.height = nodeSize
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