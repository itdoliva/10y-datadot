<!-- 
  This component controls the movement and effects of each Node
 -->

<script>
  import { onMount, getContext } from "svelte";
  import { app, complexityOn, hoveredNode} from "$lib/stores/canvas";
  import { selected, nodeSize  } from "$lib/stores/nodes";
  import * as PIXI from "pixi.js"
  
  import Pokemon from '$lib/components/webgl/atoms/Pokemon.svelte';
  


  export let id
  export let simulationNode

  export let state


  const { scene } = getContext("viz")

  // PIXI Hierarchy
  const context = new PIXI.Container()
  context.name = id

  context.hitArea = scene.node.hitArea
  context.accessibleChildren = false

  scene.addChild(context)

  // Events
  context.cursor = 'pointer';

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

  $: context.eventMode = $selected.active && $selected.id === id 
    ? 'none' 
    : 'static'


  // Variables
  $app.ticker.add(() => {
    const { attr } = simulationNode

    context.x = attr.x
    context.y = attr.y

    context.rotation = attr.rotation
    context.renderable = attr.renderable
    context.alpha = attr.alpha
    context.scale.set(attr.scale)
  })

  onMount(() => {
    simulationNode.playState(state)
  })

  // On turn complexity on or off
  $: simulationNode.playComplexity($complexityOn)

  // On state change
  $: simulationNode.playState(state)

  // On NodeSize Change



</script>


<Pokemon parent={context} id={id} />