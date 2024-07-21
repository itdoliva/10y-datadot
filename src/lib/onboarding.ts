import { get } from 'svelte/store'
import simulation from "./simulation"
import { gsap } from "gsap"
  
import { app } from "./stores/canvas"
import { cameraOffsetY } from './stores/zoom.js';
import { selected } from "./stores/nodes";

import type { OnboardingStepSettings } from "./types/onboarding"


const desktopEls = {
  collapsible: ".top-container > .collapsible",
  activate: ".top-container > .panel-menu > .dropdown-activate",
  playMyVis: ".top-container > .panel-menu > .play-btn",
  otherMenuItems: ".top-container > .panel-menu > :is(.dropdown-sortby, .clear-all-btn, .project-logo, .collapse-btn, .language-change)",
  vizContainer: ".viz-container",
  leftContainer: ".left-container",
} 

const mobileEls = {
  headerContainer: ".mobile-header-container",
  vizContainer: ".viz-container",
  filterContainer: ".filter-container",
  layoutContainer: ".layout-container",
  playMyVis: ".play-container"
}

let panelsTl

let cursor
let cursorTicker
let cursorTl


// DESKTOP
const desktopSteps: OnboardingStepSettings[] = [
  {
    contentKey: "onboarding.desktop.1",
    positionTo: ".root",
    placement: "center",
    borderPosition: "top",
  },
  {
    contentKey: "onboarding.desktop.2",
    highlight: desktopEls.vizContainer,
    positionTo: ".viz-container",
    placement: "left-start",
    borderPosition: "right",
  },
  {
    contentKey: "onboarding.desktop.3",
    highlight: desktopEls.vizContainer,
    positionTo: ".viz-container",
    placement: "left-start",
    borderPosition: "right",
    onStart: clickAnimation,
    onLeave: undoClickAnimation,
  },
  {
    contentKey: "onboarding.desktop.4",
    highlight: desktopEls.leftContainer,
    positionTo: ".left-container",
    placement: "right",
    borderPosition: "left",
    onStart: panelsAnimation,
    onLeave: undoPanelsAnimation
  },
  {
    contentKey: "onboarding.desktop.5",
    highlight: desktopEls.activate,
    positionTo: ".dropdown-activate",
    placement: "top",
    borderPosition: "bottom",
    onStart: toggleActivateDropdown,
    onLeave: toggleActivateDropdown
  },
  {
    contentKey: "onboarding.desktop.6",
    positionTo: ".play-btn",
    highlight: desktopEls.playMyVis,
    placement: "bottom",
    borderPosition: "top",
  },
]

const mobileSteps: OnboardingStepSettings[] = [
  {
    contentKey: "onboarding.mobile.1",
    positionTo: ".root",
    placement: "center",
    borderPosition: "top",
  },
  {
    contentKey: "onboarding.mobile.2",
    highlight: mobileEls.vizContainer,
    positionTo: mobileEls.layoutContainer,
    placement: "top",
    borderPosition: "top",
  },
  {
    contentKey: "onboarding.mobile.3",
    highlight: mobileEls.vizContainer,
    positionTo: mobileEls.layoutContainer,
    placement: "top",
    borderPosition: "top",
    onStart: clickAnimation,
    onLeave: undoClickAnimation,
  },
  {
    contentKey: "onboarding.mobile.4",
    highlight: mobileEls.layoutContainer,
    positionTo: mobileEls.layoutContainer,
    placement: "top",
    borderPosition: "bottom",
  },
  {
    contentKey: "onboarding.mobile.5",
    highlight: mobileEls.filterContainer,
    positionTo: mobileEls.layoutContainer,
    placement: "top",
    borderPosition: "top",
    onStart: toggleFilterPanel,
    onLeave: toggleFilterPanel,
  },
  {
    contentKey: "onboarding.mobile.6",
    positionTo: mobileEls.playMyVis,
    highlight: mobileEls.playMyVis,
    placement: "top",
    borderPosition: "bottom",
  },

]

function clickAnimation() {

  const vizEl = <HTMLElement>document.querySelector(".viz-container")
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

function panelsAnimation() {
  const leftEl = document.querySelector(desktopEls.leftContainer)
  const topEl = document.querySelector(desktopEls.collapsible)
  const leftSpanEl = document.querySelector(".onboarding .panel span.left")
  const topSpanEl = document.querySelector(".onboarding .panel span.top")
  
  panelsTl = gsap.timeline()
  
  panelsTl
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
  .set(desktopEls.collapsible, { opacity: 1 })

}

function undoPanelsAnimation() {
  if (panelsTl && panelsTl.isActive()) {
    panelsTl.kill()
  }

  const leftEl = document.querySelector(desktopEls.leftContainer)
  const topEl = document.querySelector(desktopEls.collapsible)
  const leftSpanEl = document.querySelector(".onboarding .panel span.left")
  const topSpanEl = document.querySelector(".onboarding .panel span.top")

  if (leftEl) leftEl.classList.remove("soft-blink")
  if (topEl) topEl.classList.remove("soft-blink") 

  if (leftSpanEl) leftSpanEl.classList.remove("blink") 
  if (topSpanEl) topSpanEl.classList.remove("blink") 
}


function toggleActivateDropdown() {
  const wrapper = <HTMLElement>document.querySelector(".top-container > .panel-menu > .dropdown-activate")
  const dropdwn = <HTMLElement>wrapper.querySelector(":scope .dropdown")

  const isActive = dropdwn.classList.toggle('active')

  wrapper.style.borderLeft = isActive
    ? "1px solid black"
    : "none"
}

function toggleFilterPanel() {
  const filter = <HTMLElement>document.querySelector(".filter-container")
  filter.classList.toggle('filter-open')
}

export  { desktopEls, mobileEls, desktopSteps, mobileSteps, OnboardingStepSettings }