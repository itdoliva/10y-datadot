<script lang="ts">
  import { onMount } from "svelte";
  import { get } from 'svelte/store'
  import * as PIXI from "pixi.js"
  import { _ } from "svelte-i18n"
  import { gsap } from "gsap"

  import { ongoing, contentKeyIdx } from "../../../stores/onboarding"
  import type { OnboardingStep } from "../../../types/onboarding"
  import { app } from "../../../stores/canvas"

  export let steps
  export let el

  let onboardingInitialized = false

  let index: number

  let prvStep: undefined | OnboardingStep
  let curStep: undefined | OnboardingStep

  let prvPos
  let curPos

  let outer: HTMLElement
  let inner: HTMLElement

  $: if ($ongoing) {
    startOnboarding()
  }
  

  function next(e) {
    e.stopPropagation()

    if (index < steps.length - 1) {
      index++
      updateStep()
      update()
    }
    else if (index === steps.length - 1) {
      endOnboarding()
    }
  }

  function back(e) {
    e.stopPropagation()

    if (index >= 1) {
      index--
      updateStep()
      update()
    }
  }

  function position(step) {
    const { positionTo, placement } = step

    const el = document.querySelector(positionTo)
    const { x, y, width, height } = el.getBoundingClientRect()

    const offset = 12

    let left = x
    let top = y
    let xPercent = 0
    let yPercent = 0
    let xOffset = 0
    let yOffset = 0

    
    // Centered placements
    if (placement === "center") {
      top += height * .5
      left += width *.5
      yPercent = -50
      xPercent = -50
      yOffset = -offset
    }
    else if (placement === "left" || placement === "right") {
      top += height * .5
      yPercent = -50
    }
    else if (placement === "top" || placement === "bottom") {
      left += width *.5
      xPercent = -50
    }

    if (placement.includes("left")) {
      xPercent = -100
      xOffset = -offset
    }
    else if (placement.includes("right")) {
      left += width
      xOffset = offset
    }
    else if (placement.includes("top")) {
      yPercent = -100
      yOffset = -offset
    }
    else if (placement.includes("bottom")) {
      top += height
      yOffset = offset
    }

    

    // End placements
    if (placement.includes("end")) {
      if (placement.includes("left") || placement.includes("right")) {
        top += height
        yPercent = -100
      }
      else if (placement.includes("top") || placement.includes("bottom")) {
        left += width
        xPercent = -100
      }
    }

    return { left, top, xPercent, yPercent, xOffset, yOffset }
    
  }

  function updateStep() {
    prvStep = curStep
    curStep = steps[index]
  }

  function update() {
    prvPos = curPos
    curPos = position(curStep)

    const { left, top, xPercent, yPercent, xOffset, yOffset } = curPos

    const toFadeOut = Object.values(el).filter(d => d !== curStep.highlight)

    function onEntry() {
      contentKeyIdx.set(index)

      curStep.onStart && curStep.onStart()

      const toRemove = ["center", "top", "right", "bottom", "left"]
      toRemove.forEach(d => { inner.classList.remove(d) })
      inner.classList.add(curStep.placement.split("-")[0])
    }

    const tl = gsap.timeline({ overwrite: "auto" })

    // Exit animation
    tl.to(toFadeOut.join(", "), {
      opacity: .1,
      duration: .15
    })

    if (prvPos) {
      tl.to(inner, { 
        x: prvPos.xOffset*2, 
        y: prvPos.yOffset*2,
        opacity: 0, 
        duration: .15 
      }, "<")
    }

    if (prvStep && prvStep.onLeave) {
      tl.call(prvStep.onLeave, [], "<")
    }

    // Entrance animation
    tl.call(onEntry)
      .set(outer, { left, top })
      .set(inner, { xPercent, yPercent, x: 0, y: 0, opacity: 0 })
      .to(inner, { x: xOffset, y: yOffset, opacity: 1, duration: .3 }, "<")

    if (curStep.highlight) {
      tl.to(curStep.highlight, { opacity: 1, duration: .15 }, "<")
    }
  }

  function startOnboarding() {
    if (onboardingInitialized) {
      return
    }

    onboardingInitialized = true
    index = 0
    
    loadCursor()
    updateStep()
    update()
  }

  function endOnboarding(e = undefined) {
    if (e) e.stopPropagation()

    if (curStep.onLeave) {
      curStep.onLeave()
    }
    
    const { xOffset, yOffset } = curPos
    const toFadeIn = Object.values(el)
    const tl = gsap.timeline()

    tl
      .to(toFadeIn.join(", "), { opacity: 1, duration: .5 })
      .to(inner, { x: xOffset*2, y: yOffset*2, opacity: 0, duration: .5 }, "<")
      .call(() => {
        ongoing.set(false)
        index = 0
      })
  }


  function loadCursor() {
    PIXI.Assets.load('cursor')
      .then(asset => new PIXI.Sprite(asset))
      .then(sprite => {
        sprite.renderable = false
        sprite.name = "cursor"

        const parent = get(app).stage.getChildByName("viz-container", true)
        parent.addChild(sprite)
      })
  }

</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="onboarding-layer" on:click={next} style:display={$ongoing ? "block" : "none"}>
  <div bind:this={outer} class="onboarding">

    <div bind:this={inner} class="panel">
      <div class="panel__header">
        <button on:click={endOnboarding}>X</button>
      </div>

      <div class="panel__body">
        {#each steps as step, i}
          <p style:display={i === $contentKeyIdx ? "block" : "none"}>
            {@html $_(step.contentKey)}
          </p>
        {/each}
      </div>
    
      <div class="panel__footer">
        <button on:click={back} disabled={index === 0}>Retorne</button>
        <button on:click={next}>Avançar</button>
      </div>
    </div>

  </div>
</div>

<style lang="scss">

  .onboarding-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    z-index: 999;

    .onboarding {
      position: absolute;
      width: 180px;
  
      .panel {
        z-index: 999;
        opacity: 0;

        padding: var(--fs-label);
  
        background: rgba(255, 255, 255, .1);
    
        display: flex;
        flex-direction: column;
        gap: var(--fs-label);
  
        &:global(.top) {
          border-bottom: 3px solid var(--clr-black);
        }
  
        &:global(.right) {
          border-left: 3px solid var(--clr-black);
        }
  
        &:global(.bottom), &:global(.center) {
          border-top: 3px solid var(--clr-black);
        }
  
        &:global(.left) {
          border-right: 3px solid var(--clr-black);
        }

        &__header {
          display: flex;
          justify-content: flex-end;
        }
        
        &__body {
          p {
            font-size: var(--fs-title);
            font-weight: 500;
  
            :global(span) {
              font-weight: inherit;
            }
          }
        }
    
        &__footer {
          display: flex;
          justify-content: space-between;
        }
      }
  
    }
  }
  
</style>