<script>
  import { getContext, setContext } from "svelte";
  import * as PIXI from "pixi.js"

  export let context
  export let drawFunc = undefined
  export let alpha = 1
  export let blendmode = 'NORMAL'

  const graphics = new PIXI.Graphics()

  graphics.alpha = alpha
  graphics.blendMode = PIXI.BLEND_MODES[blendmode]

  if (drawFunc) {
    drawFunc(graphics)
  }
  
  context.addChild(graphics)

  setContext('graphics', graphics)

</script>

<slot/>