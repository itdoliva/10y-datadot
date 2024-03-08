<!-- 
  This component controls the layout and state
 -->

<script>
  import { getContext, onMount } from "svelte";
  import { gsap } from "gsap";

  // Components
  import PositionManager from "./PositionManager.svelte";

  // Stores
  import { width, height, figureWidth, figureHeight } from "$lib/stores/canvas";
  import { zoomBehaviour } from "$lib/stores/zoom";
  import { nodes, selected, sortBy } from "$lib/stores/nodes"; 

  // Config
  import layoutConfig from "$lib/config/layout"
  const { shifts } = layoutConfig;

  // Exports
  export let layout


  const { resetZoom } = getContext("viz")

  let curLayout = layout
  let state = 'entrance'
  let prevCount = $nodes.activeCount


  // ------------ Timelines ------------
  const tlState = gsap.timeline()
  const tlLayout = gsap.timeline()

  tlState.add(() => {
    state = 'idle'
  }, `+=${shifts}`)


  // ------------ Reactivity ------------
  $: resort($sortBy)

  // If layout is changed
  $: if (layout != curLayout) {
    switchLayout(layout)
  }

  // Data filtered
  $: if (prevCount != $nodes.activeCount) {
    filtered()
  }

  $: updateExtents(curLayout, $width, $height, $figureWidth, $figureHeight)
  $: switchSelected($selected.active)


  function resort() {
    tlState
      .progress(1)
      .add(() => state = 'move')
      .add(() => state = 'idle', `+=${shifts}`)
  }


  function switchLayout(newLayout) {

    if (state !== 'selected') {
      tlLayout.progress(1)
      tlState.progress(1)

      tlState.add(() => {
        state = 'exit'
      }, `+=0`)
      
      tlLayout.add(() => {
        curLayout = newLayout
        resetZoom()
      }, `+=${shifts}`)
  
      tlState.add(() => {
        state = 'entrance'
      }, `+=${shifts}`)

      tlState.add(() => {
        state = 'idle'
      }, `+=${shifts}`)
    }
    else {
      curLayout = newLayout
    }

  }


  function filtered() {
    // console.log('filtered')
    const isExclusion = prevCount > $nodes.activeCount

    tlState.progress(1)
    
    // First step on exclusion is to _filter_ out, then move
    // First step on inclusion is to _move_, then filter in
    state = isExclusion ? 'filter' : 'move'
      
    tlState.add(() => {
      state = isExclusion ? 'move' : 'filter'
    }, `+=${shifts}`)

    tlState.add(() => {
      state = 'idle'
    }, `+=${shifts}`)

    prevCount = $nodes.activeCount
  }


  function switchSelected(isActive) {
    console.log('\tswitchSelected')
    
    if (isActive) {
      tlState.progress(1)
      state = 'selected'
    } else if (state === 'selected') {
      state = 'idle'
    }
  }


  function updateExtents(layout, ww, wh, fw, fh) {
    const extentX = [0, fw]
    const extentY = [0, fh]
    const extent = extentX.map((_, i) => [ extentX[i], extentY[i] ])
    zoomBehaviour.extent(extent)

    if (ww < 768 && layout === 'radial') {
      zoomBehaviour.scaleExtent([.3, 1])
    }
    else {
      zoomBehaviour.scaleExtent([1, 1])
    }
  }

</script>

<PositionManager
  layout={curLayout}
  state={state}
/>

<ul
  style:position="absolute"
  style:bottom=0
  style:right=0
  style:z-index=10
  style:font-weight=700
  style:background="white"
>
  <li>Layout: {curLayout.toUpperCase()}</li>
  <li>State: 
    <span 
      style:color={(() => {
        if (state === 'idle') return "black"
        else if (state === "selected") return "purple"
        else if (state === "filter") return "orange"
        else if (state === "move") return "cornflowerblue"
        else if (state === "entrance") return "green"
        else if (state === "exit") return "crimson"
      })()}
    style:font-weight=700
    >{state.toUpperCase()}</span></li>
</ul>