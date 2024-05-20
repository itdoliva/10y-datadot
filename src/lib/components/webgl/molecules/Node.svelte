<!-- 
  This component controls the movement and effects of each Node
 -->

<script>
  // Library
  import { onMount, getContext } from "svelte";
  import * as PIXI from "pixi.js"

  // Stores
  import { app, complexityOn, hoveredNode } from "$lib/stores/canvas";
  import { selected  } from "$lib/stores/nodes";

  export let node

  const { scene } = getContext("viz")

  // PIXI Hierarchy
  const context = node.context.context
  context.hitArea = scene.node.hitArea
  
  scene.addChild(context)

  // Events
  context.cursor = 'pointer';
  $: context.eventMode = $selected.active ? 'none' : 'dynamic'

  context.onpointerenter = (e) => {
    hoveredNode.set(node)
  }

  context.onpointerleave = () => {
    hoveredNode.set()
  }

  context.onpointerup = () => {
    selected.set($selected.active ? false : node)
  }

  onMount(() => {
    // simulationNode.playState(state)
  })



  // On turn complexity on or off
  // $: simulationNode.playComplexity($complexityOn)

  // Variables
  $app.ticker.add(() => {
    const { render } = node.attr

    if (!render) return

    context.x = render.x
    context.y = render.y

    // context.rotation = attr.rotation
    // context.renderable = attr.renderable
    // context.alpha = attr.alpha
    // context.scale.set(attr.scale)
  })





</script>
