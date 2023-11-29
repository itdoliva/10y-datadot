<script>
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";
  import * as d3 from "d3";
  import { nodes } from "$lib/store/canvas";
  import getScale from "$lib/helpers/getScale"

  export let isBlock
  export let sortBy

  const radMaxStacks = 10

  const _isBlock = writable(isBlock)
  const _sortBy = writable(sortBy)
  
  const _groupedNodes = writable(groupNodes(isBlock, sortBy))

  $: sortIds(sortBy)

  $: $_isBlock = isBlock
  $: $_sortBy = sortBy


  // General Variables
  const xScale_d = derived(([_isBlock, _sortBy]), ([$isBlock, $sortBy]) => {
    return getScale('x', $isBlock, $sortBy)
  })

  const groupedNodes_d = derived(([_isBlock, _sortBy]), ([$isBlock, $sortBy]) => {
    return groupNodes($isBlock, $sortBy)
  })


  // Radial Specific
  const nBars_d = derived(([_isBlock, groupedNodes_d]), ([$isBlock, $groupedNodes]) => {
    const nBars = !$isBlock && ~~(d3.max([...$groupedNodes.values()], d => d.length) / radMaxStacks)
    return nBars
  })


  const barPosScale_d = derived(([_isBlock, nBars_d, xScale_d]), ([$isBlock, $nBars, $xScale]) => {
    return !$isBlock && d3.scaleBand()
      .domain(d3.range(0, $nBars, 1))
      .range([0, $xScale.bandwidth()])
  })


  // Functions
  function groupNodes(isBlock, sortBy) {
    return !isBlock && d3.group($nodes, d => d[sortBy])
  }

  function sortIds(sortBy) {
    nodes.update(oldNodes => {
      return oldNodes
        .sort((a, b) => a[sortBy] - b[sortBy])
        .map((item, i) => ({ ...item, i }))
    })
  }

  $: context = {
    isBlock: _isBlock,
    sortBy: _sortBy,
    xScale: xScale_d,
    groupedNodes: groupedNodes_d,

    radMaxStacks,
    radTotalBars: nBars_d,
    radBarPos: barPosScale_d
  }

  $: setContext('layout', context)

</script>

<slot />