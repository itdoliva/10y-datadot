<script>
  import { onMount, afterUpdate } from "svelte";
  import * as PIXI from "pixi.js"
  import { gsap } from "gsap"
  import { _ } from "svelte-i18n"
  
  import { get } from 'svelte/store'

  import simulation from "$lib/simulation"

  import { ongoing, finished, contentKeyIdx, cameraOffsetY, selected, app, width, isFilterOpen } from "$lib/stores"


  const CONFIG = {
    fadeoutDuration: .15,
    fadeoutOpacity: .1,
    offset: 12,
  }

  const SELECTORS = {
    root: '#root',
    header: '#mobile-header',
    filter: '#filter-container',
    vis: '#vis-container',
    layout: '#layout-container',
    playMyVis: '#play-my-vis',

    shrink: "#shrink-panel",
    activate: "#activate",
    otherMenuItems: ":is(#sortby, #sortby-activate, #clear-all, #project-logo, #shrink-button-wrapper, #change-language)",
    leftPanel: "#left-panel",
  }

  const DESKTOP_STEPS = [
    {
      contentKey: "onboarding.desktop.1",
      positionTo: SELECTORS.root,
      placement: "center",
      borderPosition: "top",
    },
    {
      contentKey: "onboarding.desktop.2",
      highlight: SELECTORS.vis,
      positionTo: SELECTORS.vis,
      placement: "left-start",
      borderPosition: "right",
    },
    {
      contentKey: "onboarding.desktop.3",
      highlight: SELECTORS.vis,
      positionTo: SELECTORS.vis,
      placement: "left-start",
      borderPosition: "right",
      onStart: clickAnimation,
      onLeave: undoClickAnimation,
    },
    {
      contentKey: "onboarding.desktop.4",
      highlight: SELECTORS.leftPanel,
      positionTo: SELECTORS.leftPanel,
      placement: "right",
      borderPosition: "left",
      onStart: panelsAnimation,
      onLeave: undoPanelsAnimation
    },
    {
      contentKey: "onboarding.desktop.5",
      highlight: SELECTORS.activate,
      positionTo: SELECTORS.activate,
      placement: "top",
      borderPosition: "bottom",
      onStart: toggleActivateDropdown,
      onLeave: toggleActivateDropdown
    },
    {
      contentKey: "onboarding.desktop.6",
      positionTo: SELECTORS.playMyVis,
      highlight: SELECTORS.playMyVis,
      placement: "bottom",
      borderPosition: "top",
    },
  ]

  const TABLET_STEPS = [
    {
      contentKey: "onboarding.desktop.1",
      positionTo: SELECTORS.root,
      placement: "center",
      borderPosition: "top",
    },
    {
      contentKey: "onboarding.desktop.2",
      highlight: SELECTORS.vis,
      positionTo: SELECTORS.vis,
      placement: "left-start",
      borderPosition: "right",
    },
    {
      contentKey: "onboarding.desktop.3",
      highlight: SELECTORS.vis,
      positionTo: SELECTORS.vis,
      placement: "left-start",
      borderPosition: "right",
      onStart: clickAnimation,
      onLeave: undoClickAnimation,
    },
    {
      contentKey: "onboarding.desktop.4",
      highlight: SELECTORS.leftPanel,
      positionTo: SELECTORS.leftPanel,
      placement: "right",
      borderPosition: "left",
      onStart: panelsAnimation,
      onLeave: undoPanelsAnimation
    },
    {
      contentKey: "onboarding.desktop.6",
      positionTo: SELECTORS.playMyVis,
      highlight: SELECTORS.playMyVis,
      placement: "bottom",
      borderPosition: "top",
    },
  ]

  const MOBILE_STEPS = [
    {
      contentKey: "onboarding.mobile.1",
      positionTo: SELECTORS.root,
      placement: "center",
      borderPosition: "top",
    },
    {
      contentKey: "onboarding.mobile.2",
      highlight: SELECTORS.vis,
      positionTo: SELECTORS.layout,
      placement: "top",
      borderPosition: "top",
    },
    {
      contentKey: "onboarding.mobile.3",
      highlight: SELECTORS.vis,
      positionTo: SELECTORS.layout,
      placement: "top",
      borderPosition: "top",
      onStart: clickAnimation,
      onLeave: undoClickAnimation,
    },
    {
      contentKey: "onboarding.mobile.4",
      highlight: SELECTORS.layout,
      positionTo: SELECTORS.layout,
      placement: "top",
      borderPosition: "bottom",
    },
    {
      contentKey: "onboarding.mobile.5",
      highlight: SELECTORS.filter,
      positionTo: "#root",
      placement: "top-start",
      borderPosition: "bottom",
      onStart: openFilterPanel,
      onLeave: closeFilterPanel,
    },
    {
      contentKey: "onboarding.mobile.6",
      positionTo: SELECTORS.playMyVis,
      highlight: SELECTORS.playMyVis,
      placement: "top",
      borderPosition: "bottom",
    },

  ]


  const tl = gsap.timeline({ overwrite: true })

  // Onboarding HTML Elements
  let outer
  let inner

  // Reference to cursor sprites and properties
  let cursor 
  let cursorTicker
  let cursorTl

  let init = false

  let index
  let lastIndex = undefined

  let prvStep
  let curStep

  // Step definition
  let steps
  let el



 
  $: if($ongoing && !init) {
    init = true
    index = 0

    // Add cursor
    const asset = PIXI.Assets.get('cursor')
    const sprite = new PIXI.Sprite(asset)
    sprite.renderable = false
    sprite.name = "cursor"

    const parent = get(app).stage.getChildByName("vis-container", true)
    parent.addChild(sprite)

    updateStep()
  }

  onMount(() => {
    if ($width < 768) {
      el = [ 'header', 'vis', 'filter', 'layout', 'playMyVis' ].map(d => SELECTORS[d])
      steps = MOBILE_STEPS
    }
    else {
      el = ['shrink', 'activate', 'playMyVis', 'otherMenuItems', 'vis', 'leftPanel' ].map(d => SELECTORS[d])
      steps = $width < 1024 ? TABLET_STEPS : DESKTOP_STEPS
    }
  })


  afterUpdate(triggerFadeIn)


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
    tl.to(toFadeOut, { opacity: CONFIG.fadeoutOpacity, duration: CONFIG.fadeoutDuration });
  }

  function applyPreviousStepFadeOut(prevStep) {
    const { position, settings } = prevStep;

    tl.to(inner, { 
      x: position.xOffset*2, 
      y: position.yOffset*2,
      opacity: 0, 
      duration: CONFIG.fadeoutDuration 
    }, "<");

    if (settings.onLeave) {
      tl.call(settings.onLeave, [], "<");
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
      yOffset = -CONFIG.offset
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
      xOffset = -CONFIG.offset
    }
    else if (placement.includes("right")) {
      left += width
      xOffset = CONFIG.offset
    }
    else if (placement.includes("top")) {
      yPercent = -100
      yOffset = -CONFIG.offset
    }
    else if (placement.includes("bottom")) {
      top += height
      yOffset = CONFIG.offset
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
      xOffset2 = xFinal*-1 + 2*CONFIG.offset
    }
    else if (xFinal >= document.body.clientWidth) {
      xOffset2 = document.body.clientWidth - (xFinal + 2*CONFIG.offset)
    }

    if (yFinal <= 0) {
      yOffset2 = yFinal*-1 + 2*CONFIG.offset
    }
    else if (yFinal >= document.body.clientHeight) {
      yOffset2 = document.body.clientHeight - (yFinal + 2*CONFIG.offset)
    }

    return { left, top, xPercent, yPercent, xOffset, yOffset, xOffset2, yOffset2 }
  }

  function applyFadeInAnimation({ left, top, xPercent, yPercent, xOffset, yOffset, xOffset2, yOffset2 }) {
    tl
      .set(outer, { left, top })
      .set(inner, { xPercent, yPercent, x: xOffset2, y: yOffset2, opacity: 0 })
      .to(inner, { x: xOffset + xOffset2, y: yOffset + yOffset2, opacity: 1, duration: .3 }, "<");
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


  function clickAnimation() {

    const vizEl = document.querySelector("#vis-container")
    const bbox = vizEl.getBoundingClientRect()

    const x = bbox.width*.5
    const y = bbox.height*.5

    const props = { x: 0, y: 0 }

    cursor = get(app).stage.getChildByName("cursor", true)
    cursorTl = gsap.timeline()

    cursorTl
      .call(() => {
        cursor.renderable = true
      })
      .set(props, { x: bbox.width * .8, y: bbox.height * .95 })
      .to(props, { x, y, duration: 2 })
      .set(props, { x: x - 4, y: y + 4, delay: .3 })
      .set(props, { x, y, delay: .15 })
      .call(() => {
        simulation.getClosestTo(0 - 4, 0 + 4 - get(cameraOffsetY)).context.select()
        cursor.renderable = false
      })

    cursorTicker = get(app).ticker.add(() => {
      cursor.x = props.x
      cursor.y = props.y
    })

  }

  function undoClickAnimation() {
    if (cursorTl.isActive()) {
      cursorTl.kill()
      get(app).ticker.remove(cursorTicker)
      cursor.renderable = false
    }

    selected.set(null)
  }

  let panelsAnimationTl

  function panelsAnimation() {
    // Plays blinking animation on left and top panels

    const leftEl = document.querySelector(SELECTORS.leftPanel)
    const topEl = document.querySelector(SELECTORS.shrink)
    const leftSpanEl = document.querySelector("#onboarding #panel span.left")
    const topSpanEl = document.querySelector("#onboarding #panel span.top")

    panelsAnimationTl = gsap.timeline()
      .call(() => { 
        if (leftEl) leftEl.classList.add("soft-blink")
        if (leftSpanEl) leftSpanEl.classList.add("blink")
      })
      .call(() => { 
        if (leftEl) leftEl.classList.remove("soft-blink")
        if (leftSpanEl) leftSpanEl.classList.remove("blink")
      }, [], "+=2")
      .call(() => { 
        if (topEl) topEl.classList.add("soft-blink") 
        if (topSpanEl) topSpanEl.classList.add("blink") 
      }, [], "<")
      .call(() => { 
        if (topEl) topEl.classList.remove("soft-blink") 
        if (topSpanEl) topSpanEl.classList.remove("blink") 
      }, [], "+=2")
      .set(SELECTORS.shrink, { opacity: 1 })
  }

  function undoPanelsAnimation() {
    // Force stop blinking animation on left and top panels

    if (panelsAnimationTl?.isActive()) panelsAnimationTl.kill()
    
    const leftEl = document.querySelector(SELECTORS.leftPanel)
    const topEl = document.querySelector(SELECTORS.shrink)
    const leftSpanEl = document.querySelector("#onboarding #panel span.left")
    const topSpanEl = document.querySelector("#onboarding #panel span.top")

    if (leftEl) leftEl.classList.remove("soft-blink")
    if (topEl) topEl.classList.remove("soft-blink") 

    if (leftSpanEl) leftSpanEl.classList.remove("blink") 
    if (topSpanEl) topSpanEl.classList.remove("blink") 
  }

  function toggleActivateDropdown() {
    const wrapper = document.querySelector(SELECTORS.activate)
    const dropdwn = wrapper.querySelector(":scope .dropdown")

    const isActive = dropdwn.classList.toggle('active')

    wrapper.style.borderLeft = isActive
      ? "1px solid black"
      : "none"
  }

  function openFilterPanel() {
    isFilterOpen.set(true)
  }

  function closeFilterPanel() {
    isFilterOpen.set(false)
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
        class="opacity-0 w-[75vw] md:min-w-24 md:max-w-80 my-0 mx-auto pt-4 pb-3 px-4 bg-dark-gray flex flex-col gap-3 shadow"
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
