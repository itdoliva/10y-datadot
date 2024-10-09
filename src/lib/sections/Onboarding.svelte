<script>
  import { afterUpdate } from "svelte";
  import { get } from 'svelte/store'
  import { _ } from "svelte-i18n"
  import * as PIXI from "pixi.js"
  import { gsap } from "gsap"
  
  import { getSteps, getElements } from "$lib/utils/onboardingSteps"

  import { ongoing, finished, contentKeyIdx, app, width } from "$lib/stores"
  import { ONBOARDING_PARAMS } from "$lib/utils/constants"



  const tl = gsap.timeline({ overwrite: true })

  // Onboarding HTML Elements
  let outer
  let inner

  // Reference to cursor sprites and properties

  let index
  let prvIndex
  let lastIndex = undefined

  let prvStep
  let curStep

  // Step definition
  let steps
  let el


  //  Reactive
  $: if ($ongoing) {
    startOnboarding()
  }

  // Lifecycle
  afterUpdate(triggerFadeIn)


  // Onboarding functions
  function startOnboarding() {
    index = 0
    steps = getSteps($width)
    el = getElements($width)
    loadCursor()
    updateStep()
  }


  function loadCursor() {
    const asset = PIXI.Assets.get('cursor')
    const sprite = new PIXI.Sprite(asset)
    sprite.renderable = false
    sprite.name = "cursor"

    const parent = get(app).stage.getChildByName("vis-container", true)
    parent.addChild(sprite)
  }


  function isNextStepAllowed(target) {
    return target.id === 'onboarding-layer' || 
            target.id === 'onboarding' || 
            target.classList.contains("onboarding-nav")
  }
  
  
  function next(e) {
    e.stopPropagation()
    if (!isNextStepAllowed(e.target)) return

    updateIndex(1)
  }

  function back(e) {
    e.stopPropagation()
    updateIndex(-1)
  }

  function updateIndex(increment) {
    if (index + increment >= 0 && index + increment < steps.length) {
      prvIndex = index
      index += increment;
      updateStep();
    } else {
      end();
    }
  }


  function updateStep() {
    const curSettings = steps[index]

    prvStep = curStep
    curStep = curSettings 
      ? { index, position: undefined, settings: curSettings }
      : undefined

    if (curStep) triggerFadeOut()
  }



  // Fade out animation
  function triggerFadeOut() {
    const toFadeOut = el.filter(d => d !== curStep.settings.highlight).join(", ")

    applyFadeOutAnimation(toFadeOut)
    
    if (prvStep) applyPreviousStepFadeOut(prvStep);

    tl.call(() => contentKeyIdx.set(index));
  }

  function applyFadeOutAnimation(toFadeOut) {
    tl.to(toFadeOut, { opacity: ONBOARDING_PARAMS.fadeoutOpacity, duration: ONBOARDING_PARAMS.fadeoutDuration });
  }

  function applyPreviousStepFadeOut(prevStep) {
    const { position, settings } = prevStep;

    tl.to(inner, { 
      x: position.xOffset*2, 
      y: position.yOffset*2,
      opacity: 0, 
      duration: ONBOARDING_PARAMS.fadeoutDuration 
    }, "<")

    if (settings.onLeave) {
      tl.call(settings.onLeave, [], "<");
    }
    
    if (prvIndex == 0) {
      tl.call(() => {
        inner.classList.remove("md:min-w-32", "md:max-w-96")
        inner.classList.add("md:min-w-24", "md:max-w-80")
      })
    }


  }


  // Fade in animation
  function triggerFadeIn() {
    if (!$ongoing || !curStep || index !== $contentKeyIdx || lastIndex === $contentKeyIdx) return;

    setBorderPosition(curStep.settings.borderPosition)

    curStep.position = calculatePosition(curStep.settings)

    if (curStep.settings.onStart) {
      curStep.settings.onStart()
    }

    applyFadeInAnimation(curStep.position);

    if (curStep.settings.highlight) {
      tl.to(curStep.settings.highlight, { opacity: 1, duration: .15 }, "<")
    }
  }


  function setBorderPosition(borderPosition) {
    inner.style.borderTop = ""
    inner.style.borderRight = ""
    inner.style.borderBottom = ""
    inner.style.borderLeft = ""

    switch(borderPosition) {
      case "top":
        inner.style.borderTop = "4px solid #818afa"
        break
      case "right":
        inner.style.borderRight = "4px solid #818afa"
        break
      case "bottom":
        inner.style.borderBottom = "4px solid #818afa"
        break
      case "left":
        inner.style.borderLeft = "4px solid #818afa"
        break
    }
  }

  function calculatePosition(settings) {
    const positionToEl = document.querySelector(settings.positionTo);

    const { x, y, width, height } = positionToEl.getBoundingClientRect();

    const newPosition = getPlacementPosition(x, y, width, height, settings.placement);
    
    return newPosition
  }

  function getPlacementPosition(x, y, width, height, placement) {
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
      yOffset = -ONBOARDING_PARAMS.offset
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
      xOffset = -ONBOARDING_PARAMS.offset
    }
    else if (placement.includes("right")) {
      left += width
      xOffset = ONBOARDING_PARAMS.offset
    }
    else if (placement.includes("top")) {
      yPercent = -100
      yOffset = -ONBOARDING_PARAMS.offset
    }
    else if (placement.includes("bottom")) {
      top += height
      yOffset = ONBOARDING_PARAMS.offset
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

    if (xFinal <= 0)  {
      xOffset2 = xFinal*-1 + 2*ONBOARDING_PARAMS.offset
    }
    else if (xFinal >= document.body.clientWidth) {
      xOffset2 = document.body.clientWidth - (xFinal + 2*ONBOARDING_PARAMS.offset)
    }

    if (yFinal <= 0) {
      yOffset2 = yFinal*-1 + 2*ONBOARDING_PARAMS.offset
    }
    else if (yFinal >= document.body.clientHeight) {
      yOffset2 = document.body.clientHeight - (yFinal + 2*ONBOARDING_PARAMS.offset)
    }

    return { left, top, xPercent, yPercent, xOffset, yOffset, xOffset2, yOffset2 }
  }

  function applyFadeInAnimation({ left, top, xPercent, yPercent, xOffset, yOffset, xOffset2, yOffset2 }) {
    if (index == 0) tl.call(() => {
      inner.classList.remove("md:min-w-24", "md:max-w-80")
      inner.classList.add("md:min-w-32", "md:max-w-96")
    })
    
    tl
      .set(outer, { left, top })
      .set(inner, { xPercent, yPercent, x: xOffset2, y: yOffset2, opacity: 0 })
      .to(inner, { x: xOffset + xOffset2, y: yOffset + yOffset2, opacity: 1, duration: .3 }, "<")

  }



  function end(e = undefined) {
    if (e) e.stopPropagation()

    if (curStep.settings.onLeave) {
      curStep.settings.onLeave()
    }
    
    const toFadeIn = el.join(", ")

    tl
      .to(toFadeIn, { opacity: 1, duration: .5 })
      .to(inner, { x: curStep.position ? curStep.position.xOffset*2 : 0, y: curStep.position ? curStep.position.yOffset*2 : 0, opacity: 0, duration: .5 }, "<")
      .call(() => {
        ongoing.set(false)
        finished.set(true)
        index = 0
      })
  }


  
</script>



{#if $ongoing}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <section id="onboarding-layer"
    class="absolute top-0 left-0 w-full h-full z-50" 
    on:click={next}
  >

    <div id="onboarding" bind:this={outer} class="absolute">

      <article 
        id="panel" bind:this={inner} 
        class="opacity-0 w-[75vw] my-0 mx-auto pt-4 pb-3 px-4 bg-dark-gray flex flex-col gap-3 shadow"
      >

        <div class="flex justify-between h-6">

          <button class="p-0 w-6" on:click={end}>

            <svg width="100%" height="100%" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <g 
                class="stroke-white hover:opacity-60 transition-colors"
                stroke-miterlimit="10" 
                stroke-linecap="round"
              >
                <path d="M10.1 19.2C15.1258 19.2 19.2 15.1258 19.2 10.1C19.2 5.07421 15.1258 1 10.1 1C5.07421 1 1 5.07421 1 10.1C1 15.1258 5.07421 19.2 10.1 19.2Z" fill="transparent" />
                <path d="M5.7998 5.7998L14.3998 14.3998" />
                <path d="M14.3998 5.7998L5.7998 14.3998" />
              </g>
            </svg>
              
          </button>

        </div>

        <!-- Body -->
        <div class="p-0">
          {#each steps as step, i}
            <p class="text-white {i === $contentKeyIdx ? "block" : "hidden"}">
              {@html $_(step.contentKey)}
            </p>
          {/each}
        </div>
      
        <!-- Footer -->
        <div class="pt-1.5 px-0 flex justify-between gap-4">

          <button class="onboarding-nav" on:click={index === 0 ? end : back}>
            {$_(index === 0 ? "onboarding.panel.skip" : "onboarding.panel.back")}
          </button>

          <button class="onboarding-nav" on:click={next}>
            {$_("onboarding.panel.next")}
          </button>

        </div>

      </article>

    </div>
  </section>
{/if}
