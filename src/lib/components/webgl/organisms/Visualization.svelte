<script>
  import { onMount, setContext } from 'svelte'
  import * as PIXI from "pixi.js"
  import simulation from "$lib/simulation"
  import _ from "lodash"
  
	import castContainer from '$lib/actions/castContainer';
  import { width, figureWidth, figureHeight, app }  from '$lib/stores/canvas';
  import { cameraOffsetX, cameraOffsetY, zoom } from "$lib/stores/zoom";
  import { nodeSize } from "$lib/stores/nodes";

  let container

  const root = new PIXI.Container()
  const camera = new PIXI.Container()
  const scene = new PIXI.Container()

  root.name = "viz-root"
  camera.name = "outer-scene"
  scene.name = "scene"

  scene.node = {
    hitArea: new PIXI.Rectangle()
  }
  
  root.addChild(camera) //, mask
  camera.addChild(scene)

  $: camera.x = $cameraOffsetX
  $: camera.y = $cameraOffsetY
  $: camera.scale.set($zoom)

  $: scene.x = $figureWidth/2
  $: scene.y = $figureHeight/2

  $: updateNodeHitArea($nodeSize)


  onMount(() => {
    simulation.zoom.initZoom(container)
    simulation.toScene(scene, $app.ticker)
  })


  function updateNodeHitArea(nodeSize) {
    scene.node.hitArea.x = -nodeSize/2
    scene.node.hitArea.y = -nodeSize/2
    scene.node.hitArea.width = nodeSize
    scene.node.hitArea.height = nodeSize
  }

</script>

<div 
class="visualization-container"
  bind:this={container}
  bind:clientWidth={$figureWidth}
  bind:clientHeight={$figureHeight}
  use:castContainer={{ context: root, hasMask: true, centered: false }}
/>


<style>
  .visualization-container {
    width: 100%;
    height: 100%;
  }
</style>