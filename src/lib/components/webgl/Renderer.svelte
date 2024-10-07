<script>
	import { onMount } from 'svelte';
  import * as PIXI from "pixi.js"

  import BackgroundVertex from "$lib/bg.vert?raw";
  import BackgroundFragment from "$lib/bg.frag?raw";

  import { width, height, pixelRatio, app } from "$lib/stores/canvas"


  let wrapper
  let canvas
  let pixiApp

  // Load Assets
  PIXI.Assets.add({ alias: 'petal', src: '/sprites/petal.png' })
  PIXI.Assets.add({ alias: 'cursor', src: '/sprites/cursor.png' })
  PIXI.Assets.add({ alias: 'soundFX', src: '/sprites/sound-fx.json' })
  
  PIXI.Assets.load('petal')
  PIXI.Assets.load('cursor')
  PIXI.Assets.load("soundFX")

  onMount(initPixi)

  function initPixi() {
    // PIXI.settings.ROUND_PIXELS = true // making it laggy
    PIXI.settings.RESOLUTION = $pixelRatio


    pixiApp = globalThis.__PIXI_APP__ = new PIXI.Application({ 
      view: canvas, 
      resizeTo: window, 
      backgroundAlpha: 0,
      antialias: false,
    })

    addMesh()

    app.set(pixiApp)
  }

  function addMesh() {
    const bgFilter = new PIXI.Filter(BackgroundVertex, BackgroundFragment, {
      iTime: 0.0,
      iRatio: 1.0,
    })

    const meshGradient = new PIXI.Graphics()
    meshGradient.filters = [ bgFilter ]

    pixiApp.stage.addChild(meshGradient)

    pixiApp.ticker.add((delta) => {
      bgFilter.uniforms.iTime += .025 * delta;
      bgFilter.uniforms.iRatio = pixiApp.screen.width / pixiApp.screen.height;

      meshGradient.clear()
      meshGradient.beginFill(0xFFFFFF)
      meshGradient.drawRect(0, 0, pixiApp.screen.width, pixiApp.screen.height)
      meshGradient.endFill()
    });
  }



    

</script>

<canvas id="canvas" class="absolute top-0 left-0 w-full h-full" bind:this={canvas} />