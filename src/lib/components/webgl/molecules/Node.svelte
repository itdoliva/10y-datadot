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
  
  // WebGL Components
  import Pokemon from '$lib/components/webgl/atoms/Pokemon.svelte';

  export let id
  export let simulationNode


  const { scene } = getContext("viz")

  // PIXI Hierarchy
  const context = new PIXI.Container()
  context.name = id

  context.hitArea = scene.node.hitArea

  scene.addChild(context)

  // Events
  context.cursor = 'pointer';
  $: context.eventMode = $selected.active ? 'none' : 'dynamic'

  context.onpointerenter = (e) => {
    hoveredNode.set(simulationNode)
  }

  context.onpointerleave = () => {
    hoveredNode.set()
  }


  context.onpointerup = () => {
    selected.set($selected.active
      ? { active: false }
      : {
        active: true, 
        id, 
        x: simulationNode.attr.x, 
        y: simulationNode.attr.y 
      })
  }


  onMount(() => {
    // simulationNode.playState(state)
  })



  // On turn complexity on or off
  $: simulationNode.playComplexity($complexityOn)

  // Variables
  $app.ticker.add(() => {
    const { attr } = simulationNode

    if (!attr) return

    context.x = attr.x
    context.y = attr.y

    context.rotation = attr.rotation
    context.renderable = attr.renderable
    context.alpha = attr.alpha
    context.scale.set(attr.scale)
  })





</script>


<Pokemon {context} {id} />