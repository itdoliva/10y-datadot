<!-- 
  This component controls the layout, its variables, changes, and 
  the final positions of the nodes based on the current layout
 -->

<script>
  import { getContext } from "svelte";
  import { gsap } from "gsap";

  // Components
  import PositionManager from "./PositionManager.svelte";

  // Stores
  import { width, height, figureWidth, figureHeight } from "$lib/stores/canvas";
  import { zoomBehaviour } from "$lib/stores/zoom";
  import { nodes, selected } from "$lib/stores/nodes"; 

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
  $: {
    // If layout is changed
    if (layout != curLayout) {
      switchLayout(layout)
    }

    // Data filtered
    if (prevCount != $nodes.activeCount) {
      filtered()
    }
  }

  $: updateExtents(curLayout, $width, $height, $figureWidth, $figureHeight)
  $: switchSelected($selected.active)


  function switchLayout(newLayout) {
    // console.log(`switchLayout ${curLayout} -> ${newLayout}`)

    if (state !== 'selected') {
      tlLayout.clear()
      tlState.clear()

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

    tlState.clear()
    
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
      tlState.clear()
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
  style:color="yellow"
  style:background="grey"
>
  <li>Layout: {curLayout.toUpperCase()}</li>
  <li>State: {state.toUpperCase()}</li>
</ul>