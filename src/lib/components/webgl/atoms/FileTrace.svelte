<script>
  import { onDestroy } from "svelte";
  import { get } from "svelte/store";
  import * as PIXI from "pixi.js"
  import gsap from "gsap";
  
  import templates from "$lib/templates";
	import { app, width } from '$lib/stores/canvas';
  
  export let id
  export let context

  const translationRadius = 2 + Math.random() * 5

  const ticker = $app.ticker.add(tick)

  // RENDER FUNCTIONS
  const graphics = new PIXI.Graphics()
  context.addChild(graphics)

  templates[id](graphics, id >= 30 && id < 40 
    ? { anchor: [ .5, .5],  rotateSprite: false }
    : undefined)


  // ANIMATION
  const attr = { rotation: 0, translation: 0, scale: 1 }
  const tweens = []

  if (get(width) > 768) {
    // Rotation
    const clockwiseRotation = Math.random() > .5 ? 1 : -1
    tweens.push(gsap.fromTo(attr,
      { rotation: clockwiseRotation * -Math.PI/12 },
      { rotation: clockwiseRotation * Math.PI/12, repeat: -1, duration: 1.75 + Math.random() * 1.5, yoyo: true, ease: "none" }
    ))
  
    // Translation
    const clockwiseTranslation = Math.random() > .5 ? 1 : -1
    tweens.push(gsap.fromTo(attr,
      { translation: 0 },
      { translation: clockwiseTranslation * 2*Math.PI, repeat: -1, duration: 6 + Math.random() * 4, ease: "none" }
    ))
  
    // Scale
    tweens.push(gsap.fromTo(attr,
      { scale:.9 + Math.random()*.1 },
      { scale: 1.15 + Math.random()*.05, repeat: -1, duration: 3 + Math.random(), yoyo: true, ease: "none" },
    ))
  }

  else {
    graphics.scale.set(.7)
  }


  function tick() {
    if (!tweens.length) {
      return
    }

    graphics.rotation = attr.rotation
    graphics.x = Math.cos(attr.translation) * translationRadius
    graphics.y = Math.sin(attr.translation) * translationRadius
    graphics.scale.set(attr.scale)
  }

  // LIFECYCLE FUNCTIONS
  onDestroy(() => {
    ticker.remove(tick)
    tweens.forEach(tween => tween.kill())
  })

</script>