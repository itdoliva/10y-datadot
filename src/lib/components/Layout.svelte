<script>
  import { beforeUpdate, onMount, setContext } from "svelte";
  import { writable, derived } from "svelte/store";
  import { gsap } from "gsap"

  import { width, height, figureWidth, figureHeight } from "$lib/store/canvas";
  import { zoomBehaviour, updateExtents, resetZoomFactory, cameraOffset } from "$lib/store/zoom";
  import { nodes, nNodes, nodeSize, gap } from "$lib/store/nodes";
  import getBlockConfig from "$lib/helpers/getBlockConfig"
  import getRadialConfig from "$lib/helpers/getRadialConfig"
  import randomDensity from "$lib/utility/randomDensity"

  // Overall Config
  const maxStacksK = .25
  const innerRadius = 180

  const shiftms = 1000
  const shifts = shiftms/1000


  export let layout

  let wrapper
  let resetZoom = () => undefined

  let nextLayout = layout
  let prevCount = $nNodes
  let prevState

  const tl = gsap.timeline()
  
  // Stores  
  const _layout = writable(layout)
  const _state = writable('entrance')
  const _filter = writable()
  const _config = writable()
  const _prevConfig = writable()



  onMount(() => {
    resetZoom = resetZoomFactory(wrapper, shiftms)
  })


  beforeUpdate(() => {
    // If layout is changed
    if (layout != $_layout) {
      nextLayout = layout
      _state.set('exit')
    }


    // Data filtered
    if (prevCount != $nNodes) {
      const filter = prevCount > $nNodes ? 'exclusion' : 'inclusion'

      // Defines the first state of the filter type
      const filterState = filter === 'exclusion' 
        ? 'filter' // First step on exclusion is to _filter_ out, then move
        : 'move' // First step on inclusion is to _move_, then filter in

      _filter.set(filter)
      _state.set(filterState)

      prevCount = $nNodes
    }


    if (prevState != $_state) {
      prevState = $_state
      tl.clear()
      tl.add(() => {
        if ($_state === 'exit') {
          _state.set('entrance')
          _layout.set(nextLayout)
          nextLayout = undefined
        }
        else if ($_state === 'entrance') {
          _state.set('idle')
        }
        else if ($_filter === 'exclusion' && $_state === 'filter') {
          _state.set('move')
        } 
        else if ($_filter === 'exclusion' && $_state === 'move') {
          _state.set('idle')
          _filter.set()
        } 
        else if ($_filter === 'inclusion' && $_state === 'move') {
          _state.set('filter')
        } 
        else if ($_filter === 'inclusion' && $_state === 'filter') {
          _state.set('idle')
          _filter.set()
        } 

      }, `+=${shifts}`)
    }
  })


  $: $_layout, resetZoom()
  $: updateExtents($_layout, $width, $height, $figureWidth, $figureHeight)
  

  const getPos_d = derived([_layout, nodes, nodeSize, gap, figureWidth, figureHeight],
    ([$layout, $nodes, $size, $gap, $fw, $fh]) => {
      const nNodes = $nodes.filter(d => d.active).length
      return getPos[$layout](nNodes, "year", $size, $gap, $fw, $fh)
    }
  )

  // Layouts
  const getPos = {}

  getPos.colEntranceUpTo = shiftms/1000 * .2
  getPos.fullColEntranceDuration = shiftms/1000 - getPos.colEntranceUpTo


  getPos.block = (nNodes, groupBy, nodeSize, gap, fw, fh) => {
    const { rows, columns, padding, extent, maxRowsOnView, blockHeight } = getBlockConfig(nNodes, nodeSize, gap, fw, fh)
    
    // The calculation below support block entrance animation
    const columnDensities = randomDensity(columns)
    const timeStepByRow = +(getPos.fullColEntranceDuration / maxRowsOnView).toFixed(4)

    console.log({columns, nNodes, rows, maxRowsOnView })

    _prevConfig.set($_config)
    _config.set({ rows, columns, columnDensities, timeStepByRow })

    // Adjust zoom
    zoomBehaviour.translateExtent(extent)
    resetZoom(0)

    const getDelay = (data, prev=false) => {
      if (!data) return 0

      const { row, column } = data

      const config = prev ? $_prevConfig : $_config
      const { columnDensities, timeStepByRow } = config

      const columnDelay = columnDensities[column] * getPos.colEntranceUpTo
      const rowDelay = timeStepByRow * row

      return +(columnDelay + rowDelay).toFixed(3)
    }

    return ({ i }) => {
      // Calculate the node row and column indices for the given i
      const column = Math.floor(i % columns)
      const row = Math.floor(i / columns)

      const fx = column * (nodeSize + gap) + nodeSize/2 - fw/2 + padding.left
      const fy = row * (nodeSize + gap) + nodeSize/2 - fh/2 + padding.top

      const delay = getDelay({ row, column})
      


      return { fx, fy, data: { row, column, delay, getDelay, columns, rows, i } }
    }
  }

  getPos.radial = (nNodes, groupBy, nodeSize, gap, fw, fh) => {
    const {
      extent,
      grouped,
      sectorRadiansScale,
      pileRadiansScale,
      maxStacks
    } = getRadialConfig($nodes, nNodes, nodeSize, gap, groupBy, innerRadius, maxStacksK, fw, fh)

    _config.set({ grouped, sectorRadiansScale, pileRadiansScale, innerRadius, maxStacks })

    // Adjust zoom
    zoomBehaviour.translateExtent(extent)
    resetZoom(0)

    return (node) => {
      // Get category of sector
      const catValue = node[groupBy]

      // Get occurrence of this node in the group of nodes with the same catValue
      const catNodes = grouped.get(catValue)
      const nodeIndex = catNodes.findIndex(d => d.id === node.id)
      const pileIndex = Math.floor(nodeIndex / maxStacks)
      const stackIndex = nodeIndex % maxStacks

      const radiansOffset = catNodes.diffPiles * pileRadiansScale.bandwidth()/2
      const radians = sectorRadiansScale(catValue) + pileRadiansScale(pileIndex) + radiansOffset

      const radius = innerRadius + stackIndex * (nodeSize + gap)

      return { fx: 0, fy: radius, rotation: radians, data: { radius, radians } }
    }
  }



  $: setContext('layout', {
    wrapper,
    getPos: getPos_d,
    layout: _layout,
    state: _state,
    config: _config,
    filter: _filter,
    shiftms,
  })



</script>


<div 
  class="wrapper"
  bind:this={wrapper}
  bind:clientWidth={$figureWidth}
  bind:clientHeight={$figureHeight}
>
  <div>
    <p style:opacity={$_filter ? 1 : 0}>filter: {$_filter}</p>
    <p>state: {$_state}</p>
  </div>

  {#if $figureWidth > 100}
    <slot />
  {/if}
</div>

<style lang="scss">
  .wrapper {
    width: 100%;
    height: 100%;

    position: relative;


    div {
      position: absolute;
      bottom: 0;
      right: 110%;
      font-weight: 900;

      p {
        background: yellow;
        padding: 0 12px;
      }
    }
  }
</style>