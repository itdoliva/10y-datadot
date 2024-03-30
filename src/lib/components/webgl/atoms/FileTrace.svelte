<script>
  import { onDestroy } from "svelte";
  import * as PIXI from "pixi.js"
  import gsap from "gsap";
  
  import castContainer from '$lib/actions/castContainer';
  import templates from "$lib/templates";
	import { app } from '$lib/stores/canvas';
  import { categories } from '$lib/stores/nodes';
  
  export let id

  let size

  const category = Object.values($categories).flat().find(d => d.id === id)


  // RENDER FUNCTIONS
  const container = new PIXI.Container()
  const graphics = new PIXI.Graphics()
  container.addChild(graphics)

  templates[id](graphics, id >= 30 && id < 40 
    ? { anchor: [ .5, .5],  rotateSprite: false }
    : undefined)


  // ANIMATION
  const tweens = {}

  const t = {
    rotation: 0,
    translation: 0,
    scale: 1
  }

  // Rotation
  const thetaMin = -Math.PI/12;
  const thetaMax = Math.PI/12; 

  tweens.rotation = gsap.fromTo(t,
    { rotation: thetaMin },
    { rotation: thetaMax, repeat: -1, duration: 1.75 + Math.random() * .5, yoyo: true, ease: "none" }
  )

  // Translation
  const radius = 5 + Math.random() * 2

  tweens.translation = gsap.fromTo(t,
    { translation: 0 },
    { translation: 2*Math.PI, repeat: -1, duration: 10 + Math.random(), ease: "none" }
  )

  // Scale
  tweens.scale = gsap.fromTo(t,
    { scale:1.2 + Math.random()*.1 },
    { scale: 1.35 + Math.random()*.05, repeat: -1, duration: 3 + Math.random(), yoyo: true, ease: "none" },
  )


  function animate() {
    graphics.rotation = t.rotation
    graphics.x = Math.sin(t.translation) * radius
    graphics.y = Math.cos(t.translation) * radius
    graphics.scale.set(t.scale)
  }

  const ticker = $app.ticker.add(animate)


  // LIFECYCLE FUNCTIONS
  onDestroy(() => {
    ticker.remove(animate)

    Object.values(tweens)
      .forEach(tween => tween.kill())
  })

</script>

<li class="file-traces__item">

  <div 
    class="primitive-holder"
    use:castContainer={{ context: container }}
    bind:clientWidth={size}
  />

  <p class="label">{category.alias}</p>

</li>

<style lang="scss">
  .file-traces__item {
    height: 3rem;

    display: grid;
    grid-template-columns: 4rem 1fr;
    
    padding-left: 2rem;

    gap: 2rem;

    justify-content: end;
  }

  .primitve-holder {
    aspect-ratio: 1/1;
  }

  .label {
    align-self: center;
    font-size: .8rem;
    text-transform: lowercase;
    text-decoration: underline;
  }
</style>