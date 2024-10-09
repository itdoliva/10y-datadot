import { get } from "svelte/store"
import { gsap } from "gsap"
import { getCtxByName } from "./pixiHelpers"
import simulation from "$lib/simulation"
import { cameraOffsetY, selected, isFilterOpen } from "$lib/stores"

export function getSteps(width) {
  if (width < 768) return MOBILE_STEPS
  return width < 1024 ? TABLET_STEPS : DESKTOP_STEPS
}

export function getElements(width) {
  if (width < 768) return MOBILE_EL_KEYS.map(d => SELECTORS[d])
  return NOT_MOBILE_EL_KEYS.map(d => SELECTORS[d])
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

const MOBILE_EL_KEYS = [ 'header', 'vis', 'filter', 'layout', 'playMyVis' ]
const NOT_MOBILE_EL_KEYS = ['shrink', 'activate', 'playMyVis', 'otherMenuItems', 'vis', 'leftPanel' ]

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


let cursor 
let cursorTl

let panelsAnimationTl


function clickAnimation() {
  const bbox = document.querySelector("#vis-container").getBoundingClientRect()

  const x = bbox.width*.5
  const y = bbox.height*.5

  cursor = getCtxByName('cursor')
  cursorTl = gsap.timeline()

  cursorTl
    .call(() => {
      cursor.renderable = true
    })
    .set(cursor, { x: bbox.width * .8, y: bbox.height * .95 })
    .to(cursor, { x, y, duration: 2 })
    .set(cursor, { x: x - 4, y: y + 4, delay: .3 })
    .set(cursor, { x, y, delay: .15 })
    .call(() => {
      simulation.getClosestTo(0 - 4, 0 + 4 - get(cameraOffsetY)).context.select()
      cursor.renderable = false
    })
}

function undoClickAnimation() {
  if (cursorTl.isActive()) {
    cursorTl.kill()
    cursor.renderable = false
  }

  selected.set(null)
}


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