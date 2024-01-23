<script>
  import { setContext } from "svelte";
  import * as PIXI from "pixi.js"
  import { app, width } from "$lib/store/canvas";

  let div

  const container = new PIXI.Container()

  $app.stage.addChild(container)

  $app.ticker.add(() => {
    if (!div) return

    const bbox = div.getBoundingClientRect()
    container.x = bbox.x + bbox.width/2
    container.y = bbox.y + bbox.height/2
  })


  setContext('container', container)
</script>

<div bind:this={div}>
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