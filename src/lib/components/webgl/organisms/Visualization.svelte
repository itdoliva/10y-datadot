<script>
  import { onMount, setContext } from 'svelte'
  import * as PIXI from "pixi.js"
  import * as d3 from "d3";
  
	import castContainer from '$lib/actions/castContainer';
  import { width, figureWidth, figureHeight, app }  from '$lib/stores/canvas';
  import { cameraOffsetX, cameraOffsetY, zoom } from "$lib/stores/zoom";
  import { nodeSize } from "$lib/stores/nodes";
  
  import LayoutManager from '$lib/components/webgl/molecules/LayoutManager.svelte';
  import ZoomController from "$lib/simulation/ZoomController"

  export let layout

  let zoomController
  let container

  const root = new PIXI.Container()
  const camera = new PIXI.Container()
  const scene = new PIXI.Container()

  // const mask = new PIXI.Graphics()
  // mask.beginFill(0xFFFFFF)
  // mask.drawCircle(0, 0, 360)
  // mask.endFill()

  // mask.beginFill(0x000000 )
  // mask.drawCircle(0, 0, 120)
  // mask.endFill()

  root.name = "viz-root"
  camera.name = "outer-scene"
  scene.name = "scene"

  scene.node = {
    hitArea: new PIXI.Rectangle()
  }

  
  root.addChild(camera) //, mask
  camera.addChild(scene)
  // scene.mask = mask

  $: camera.x = $cameraOffsetX
  $: camera.y = $cameraOffsetY
  $: camera.scale.set($zoom)

  $: scene.x = $figureWidth/2
  $: scene.y = $figureHeight/2

  $: updateNodeHitArea($nodeSize)

  $: if ($width < 768 && layout === 'radial') {
    zoomController?.scaleExtent([.3, 1])
    zoomController?.scale(.5)
  } 
  else {
    zoomController?.scaleExtent([.1, 3])
  }

  onMount(() => {
    zoomController = new ZoomController(container)
  })

  setContext('viz', { scene })

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

{#if $figureWidth + $figureHeight > 0 && zoomController}
  <LayoutManager bind:layout {zoomController} />
{/if}


<style>
  .visualization-container {
    width: 100%;
    height: 100%;
  }
</style>