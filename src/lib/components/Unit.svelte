<script>
  import { getContext } from "svelte";
  import { 
    width, 
    height, 
    pixelRatio, 
    nodeSize, 
    plotWidth, 
    gap, 
    padding 
  } from "$lib/store/canvas"
  import Pokemon from "$lib/components/Pokemon.svelte";

  export let node

  const { 
    isBlock, 
    sortBy, 
    xScale, 
    groupedNodes, 
    radMaxStacks,
    radBarPos 
  } = getContext("layout")

  $: pos = getPos(node, $isBlock, $sortBy, $xScale, $groupedNodes, radMaxStacks, $radBarPos, $width, $height, $pixelRatio, $plotWidth, $gap, $padding)


  function getPos(node, isBlock, sortBy, xScale, groupedNodes, radMaxStacks, radBarPos) {
    return isBlock
      ? getBlcPos(node)
      : getRadPos(node, sortBy, xScale, groupedNodes, radMaxStacks, radBarPos)
  }


  function getRadPos(node, sortBy, xScale, groupedNodes, maxStacks, barPos) {
    const category = node[sortBy]

    let radians = xScale(category)

    // Get occurrence of this node in the group of nodes with the same category
    const catNodes = groupedNodes.get(category)
    const nodeIndex = catNodes.findIndex(d => d.id === node.id)
    const barIndex = Math.floor(nodeIndex / maxStacks)
    const stackIndex = nodeIndex % maxStacks
    
    radians += barPos(barIndex)

    const radius = 200 + stackIndex * $nodeSize/1.5

    const x = (Math.cos(radians) * radius + $width/2) * $pixelRatio
    const y = (Math.sin(radians) * radius + $height/2) * $pixelRatio
      
    return { x, y, rotation: radians }
  }

  function getBlcPos({ i }) {
    // Calculate the number of squares per row
    const squaresPerRow = Math.floor(($plotWidth + $gap) / ($nodeSize + $gap))

    // Calculate the row and column indices for the given i
    const rowIndex = Math.floor(i / squaresPerRow)
    const colIndex = i % squaresPerRow

    // Calculate the x and y positions
    const x = colIndex * ($nodeSize + $gap) + $nodeSize/2 + $padding.left
    const y = rowIndex * ($nodeSize + $gap) + $nodeSize/2 + $padding.top

    return { x, y }
  }



</script>

<Pokemon {node} {...pos} />