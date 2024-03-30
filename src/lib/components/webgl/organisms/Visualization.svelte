<script>
  import { onMount, setContext } from 'svelte'
  import * as PIXI from "pixi.js"
  import * as d3 from "d3";
  
	import castContainer from '$lib/actions/castContainer';
  import { app, figureWidth, figureHeight }  from '$lib/stores/canvas';
  import { cameraOffsetX, cameraOffsetY, zoom } from "$lib/stores/zoom";
  import { nodeSize } from "$lib/stores/nodes";
  
  import LayoutManager from '$lib/components/webgl/molecules/LayoutManager.svelte';
  import ZoomController from "$lib/simulation/ZoomController"

  export let layout

  let zoomController

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
    zoomController = new ZoomController($app.view)
  })

  setContext('viz', { 
    root, 
    scene,
    getZoomController: () => zoomController
  })



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

<LayoutManager bind:layout />


<style>
  .container {
    width: 100%;
    height: 100%;
  }
</style>