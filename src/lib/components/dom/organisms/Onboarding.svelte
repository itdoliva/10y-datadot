<script lang="ts">
  import { onMount, afterUpdate } from "svelte";
  import { get } from 'svelte/store'
  import * as PIXI from "pixi.js"
  import { _ } from "svelte-i18n"
  import { gsap } from "gsap"

  import { ongoing, finished, contentKeyIdx } from "../../../stores/onboarding"
  import type { OnboardingStepSettings, OnboardingStep } from "../../../types/onboarding"
  import Icon from "../atoms/Icon.svelte";
  import { app } from "../../../stores/canvas"

  import LanguageChange from "./LanguageChange.svelte";

  export let steps: OnboardingStepSettings[]
  export let el

  const fadeOutDuration = .15

  const tl = gsap.timeline({ overwrite: true })

  const history = {
    lastIndex: undefined
  }

  let onboardingInitialized = false

  let index: number

  let prvStep: undefined | OnboardingStep
  let curStep: undefined | OnboardingStep

  let outer: HTMLElement
  let inner: HTMLElement

  $: $ongoing && start()

  afterUpdate(fadeIn)
  
  function next(e) {
    e.stopPropagation()

    if (!e.target.classList.contains("onboarding-layer") && 
        !e.target.classList.contains("onboarding") && 
        !e.target.classList.contains("onboarding-nav-btn")) {
      return
    }

    if (index < steps.length - 1) {
      index++
      updateStep()
    }
    else if (index === steps.length - 1) {
      end()
    }
  }

  function back(e) {
    e.stopPropagation()

    if (index >= 1) {
      index--
      updateStep()
    }
  }

  function updateStep() {

    const curSettings = steps[index]

    prvStep = curStep
    curStep = curSettings 
      ? { index, position: undefined, settings: curSettings }
      : undefined

    fadeOut()
  }

  function fadeOut() {
    // Select DOM elements not in current step's highlight
    const toFadeOut = Object.values(el).filter(d => d !== curStep.settings.highlight).join(", ")

    tl.to(toFadeOut, { opacity: .1, duration: fadeOutDuration })

    if (prvStep) {
      const { position, settings } = prvStep

      tl.to(inner, { 
        x: position.xOffset*2, 
        y: position.yOffset*2,
        opacity: 0, 
        duration: fadeOutDuration 
      }, "<")

      if (settings.onLeave) {
        tl.call(settings.onLeave, [], "<")
      }
    }

    tl.call(() => contentKeyIdx.set(index))
  }

  function fadeIn() {
    if (!curStep || index !== $contentKeyIdx || history.lastIndex === $contentKeyIdx) {
      return
    }

    // Prevents repeated animations when changing language
    history.lastIndex = $contentKeyIdx

    const { positionTo, placement, borderPosition, highlight, onStart } = curStep.settings

    const positionToEl = document.querySelector(positionTo)
    const { x, y, width, height } = positionToEl.getBoundingClientRect()

    const offset = 12

    let left = x
    let top = y
    let xPercent = 0
    let yPercent = 0
    let xOffset = 0
    let yOffset = 0

    // Offset to prevent panel from going out of screen
    let xOffset2 = 0
    let yOffset2 = 0
    
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

    // In-screen offset
    const xFinal = left + (inner.clientWidth * xPercent/100) + xOffset
    const yFinal = top + (inner.clientHeight * yPercent/100) + yOffset

    if (xFinal < 0)  {
      xOffset2 = xFinal*-1 + offset
    }
    else if (xFinal > document.body.clientWidth) {
      xOffset2 = document.body.clientWidth - xFinal - offset
    }

    if (yFinal < 0) {
      yOffset2 = yFinal*-1 + offset
    }
    else if (yFinal > document.body.clientHeight) {
      yOffset2 = document.body.clientHeight - yFinal - offset
    }

    curStep.position = { left, top, xPercent, yPercent, xOffset, yOffset, xOffset2, yOffset2 }
    

    // Entrance animation
    tl
      .call(() => {
        onStart && onStart()

        // Change styling based on placement direction
        const toRemoveClasses = [ "top", "right", "bottom", "left" ]
        toRemoveClasses.forEach(d => { inner.classList.remove(d) })
        inner.classList.add(borderPosition)
      })
      .set(outer, { left, top })
      .set(inner, { xPercent, yPercent, x: xOffset2, y: yOffset2, opacity: 0 })
      .to(inner, { x: xOffset + xOffset2, y: yOffset + yOffset2, opacity: 1, duration: .3 }, "<")

    if (highlight) {
      tl.to(highlight, { opacity: 1, duration: .15 }, "<")
    }
  }

  function start() {
    if (onboardingInitialized) {
      return
    }

    onboardingInitialized = true
    index = 0
    
    loadCursor()
    updateStep()
  }

  function end(e = undefined) {
    if (e) e.stopPropagation()

    if (curStep.settings.onLeave) {
      curStep.settings.onLeave()
    }
    
    const { xOffset, yOffset } = curStep.position
    const toFadeIn = Object.values(el).join(", ")

    tl
      .to(toFadeIn, { opacity: 1, duration: .5 })
      .to(inner, { x: xOffset*2, y: yOffset*2, opacity: 0, duration: .5 }, "<")
      .call(() => {
        ongoing.set(false)
        finished.set(true)
        index = 0
      })
  }

  function loadCursor() {
    console.log(Date.now(), "loadCursor()")

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
        <button class="clean-btn" on:click={end}>
          <Icon icon="close" />
        </button>

      </div>

      <div class="panel__body">
        {#each steps as step, i}
          <p style:display={i === $contentKeyIdx ? "block" : "none"}>
            {@html $_(step.contentKey)}
          </p>
        {/each}
      </div>
    
      <div class="panel__footer">
        <button class="clean-btn onboarding-nav-btn" on:click={$contentKeyIdx === 0 ? end : back}>{$_($contentKeyIdx === 0 ? "onboarding.panel.skip" : "onboarding.panel.back")}</button>
        <button class="clean-btn onboarding-nav-btn" on:click={next}>{$_("onboarding.panel.next")}</button>
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
      width: 220px;
  
      .panel {
        z-index: 9999;
        opacity: 0;

        padding: var(--fs-label);
  
        background: var(--clr-dark-gray);
    
        display: grid;
        grid-template-rows: min-content min-content max-content;
        grid-template-areas: 
          "header"
          "body"
          "footer";

        gap: var(--fs-label);
  
        &:global(.top) {
          border-top: 4px solid var(--clr-accent);
        }
  
        &:global(.right) {
          border-right: 4px solid var(--clr-accent);
        }
  
        &:global(.bottom) {
          border-bottom: 4px solid var(--clr-accent);
        }
  
        &:global(.left) {
          border-left: 4px solid var(--clr-accent);
        }

        &__header { grid-area: header; }
        &__body { grid-area: body; }
        &__footer { grid-area: footer; }

        &__header {
          display: flex;
          justify-content: space-between;
          height: calc(2.2*var(--fs-label));

          button {
            padding: 0;

            width: calc(2.2*var(--fs-label));

            color: var(--clr-white);

            &:hover {
              color: var(--clr-accent);
            }

            &:active {
              color: var(--clr-accent-low);
            }
          }
        }
        
        &__body {
          padding: 0 var(--fs-label);

          p {
            color: var(--clr-white);
            font-size: var(--fs-title);
  
            :global(span) {
              font-weight: inherit;
            }
          }
        }
    
        &__footer {
          padding: calc(.5*var(--fs-label)) var(--fs-label);

          display: flex;
          justify-content: space-between;
          gap: 1rem;

          button {
            font-size: var(--fs-label);
            text-transform: lowercase;

            padding: calc(.5*var(--fs-label)) calc(1*var(--fs-label));

            color: var(--clr-white);
            
            border-radius: 2px;
            border: 1px solid var(--clr-white);

            &:hover {
              border: 1px solid var((--clr-accent));
              color: var(--clr-accent);
            }

            &:active {
              border: 1px solid var((--clr-accent-low));
              color: var(--clr-accent-low);
            }
          }
        }
      }
  
    }
  }
  
</style>