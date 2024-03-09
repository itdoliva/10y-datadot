<!-- 
  This component controls the movement and effects of each Node
 -->

<script>
  import { onMount, getContext } from "svelte";
  import { app, complexityOn } from "$lib/stores/canvas";
  import { selected } from "$lib/stores/nodes";
  import * as PIXI from "pixi.js"
  import Pokemon from './Pokemon.svelte';
  


  export let id
  export let simulationNode

  export let layout
  export let state


  const { scene } = getContext("viz")

  // PIXI Hierarchy
  const container = new PIXI.Container()
  container.name = id
  scene.addChild(container)

  // Events
  container.accessible = true
  container.cursor = 'pointer';

  container.onpointerup = () => {
    selected.set($selected.active
      ? { active: false }
      : {
        active: true, 
        id, 
        x: simulationNode.attr.x, 
        y: simulationNode.attr.y 
      })
  }

  $: container.eventMode = $selected.active && $selected.id === id 
    ? 'none' 
    : 'static'


  // Variables
  $app.ticker.add(() => {
    const { attr } = simulationNode

    container.x = attr.x
    container.y = attr.y

    container.rotation = attr.rotation
    container.renderable = attr.renderable
    container.alpha = attr.alpha
    container.scale.set(attr.scale)
  })

  onMount(() => {
    simulationNode.playState(state)
  })

  // On turn complexity on or off
  $: simulationNode.playComplexity($complexityOn)

  // On state change
  $: simulationNode.playState(state)



</script>


<Pokemon parent={container} id={id} />