<script>
  import { setContext } from "svelte";
  import * as PIXI from "pixi.js"
  import { app } from "$lib/stores/canvas";

  let _class = ''
  export { _class as class }
  export let parent = $app.stage
  
  const container = new PIXI.Container()
  
  let div

  // Nest container on stage or parent
  parent.addChild(container)

  // Position container according to the div bounding rect
  $app.ticker.add(() => {
    if (!div) return

    const bbox = div.getBoundingClientRect()
    container.x = bbox.x + bbox.width/2 - parent.x
    container.y = bbox.y + bbox.height/2 - parent.y
  })

  setContext('container', container)
</script>

<div class={_class} bind:this={div}>
  <slot />
</div>

<style>
  div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>