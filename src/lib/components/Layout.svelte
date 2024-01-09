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

  const blockParams = {}
  blockParams.colEntranceUpTo = shiftms/1000 * .2
  blockParams.fullColEntranceDuration = shiftms/1000 - blockParams.colEntranceUpTo


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
  const _padding = writable({ left: 0, top: 0 })


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
      _filter.set(prevCount > $nNodes ? 'exclusion' : 'inclusion')
      _state.set('filterA')
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
        else if ($_state === 'entrance' || $_state === 'filterB') {
          _state.set('idle')
        }
        else if ($_state == 'filterA') {
          _state.set('filterB')
        }
      }, `+=${shifts}`)
    }
  })


  $: $_layout, resetZoom()
  $: updateExtents($_layout, $width, $height, $figureWidth, $figureHeight)
  

  const getPos_d = derived([_layout, nNodes, nodeSize, gap, figureWidth, figureHeight],
    ([$layout, $nNodes, $size, $gap, $fw, $fh]) => {
      return getPos[$layout]($nNodes, "year", $size, $gap, $fw, $fh)
    }
  )

  // Layouts
  const getPos = {}

  getPos.block = (nNodes, groupBy, nodeSize, gap, fw, fh) => {
    const { rows, columns, padding, extent } = getBlockConfig(nNodes, nodeSize, gap, fw, fh)

    // The calculation below support block entrance animation
    const columnDensities = randomDensity(columns)

    const timeStepByRow = +(blockParams.fullColEntranceDuration / rows).toFixed(4)

    _padding.set(padding)
    _config.set({ rows, columns, columnDensities, timeStepByRow })

    // Adjust zoom
    zoomBehaviour.translateExtent(extent)
    resetZoom(0)

    return ({ i }) => {
      // Calculate the node row and column indices for the given i
      const column = Math.floor(i % columns)
      const row = Math.floor(i / columns)

      const fx = column * (nodeSize + gap) + nodeSize/2
      const fy = row * (nodeSize + gap) + nodeSize/2

      const colDensity = columnDensities[column]
      const entryAt = colDensity * blockParams.colEntranceUpTo + timeStepByRow * row

      return { fx, fy, data: { row, column, entryAt } }
    }
  }

  getPos.radial = (nNodes, groupBy, nodeSize, gap, fw, fh) => {
    const {
      padding,
      extent,
      grouped,
      sectorRadiansScale,
      pileRadiansScale,
      maxStacks
    } = getRadialConfig($nodes, nNodes, nodeSize, gap, groupBy, innerRadius, maxStacksK, fw, fh)

    _padding.set(padding)
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
    padding: _padding,
    shiftms,
    blockParams,
  })



</script>


<div 
  class="wrapper"
  bind:this={wrapper}
  bind:clientWidth={$figureWidth}
  bind:clientHeight={$figureHeight}
>
  <p>{$_state}</p>
  {#if $figureWidth > 100}
    <slot />
  {/if}
</div>

<style lang="scss">
  .wrapper {
    width: 100%;
    height: 100%;

    position: relative;

    p {
      position: absolute;
      top: -12px;
      left: 12px;
    }
  }
</style>