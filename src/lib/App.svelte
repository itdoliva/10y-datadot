<script>
  import Canvas from "$lib/components/Canvas.svelte";
  import Unit from "$lib/components/SimpleUnit.svelte";
  import * as d3 from "d3"
  import { width, height, pixelRatio, nNodes, nodeSize, gap, plotWidth, padding } from "$lib/store/canvas";

  let asBlock = true

  nNodes.set(387)
  const nodes = []

  const firstDt = new Date(2013, 0, 1)
  const lastDt = new Date(2023, 0, 1)

  const radScale = d3.scaleTime()
    .domain([firstDt, lastDt])
    .range([0, 2*Math.PI])


  const datePositions = {}

  for (let i = 0; i < $nNodes; i++) {
    const year = 2013 + Math.floor(Math.random()*11)
    const month = Math.floor(Math.random()*12)
    const date = new Date(year, month, 1)

    if (date in datePositions) {
      datePositions[date] += 1
    } else {
      datePositions[date] = 0
    }

    nodes.push({ date, dateRank: datePositions[date] })
  }



  function getNodeBlockPos(i) {
    // Calculate the number of squares per row
    const squaresPerRow = Math.floor(($plotWidth + $gap) / ($nodeSize + $gap))

    // Calculate the row and column indices for the given i
    const rowIndex = Math.floor(i / squaresPerRow)
    const colIndex = i % squaresPerRow

    // Calculate the x and y positions
    const x = colIndex * ($nodeSize + $gap) + $nodeSize/2 + $padding.left
    const y = rowIndex * ($nodeSize + $gap) + $nodeSize/2 + $padding.top

    return { x, y, radians: false };
}

function getNodeRadPos({ date, dateRank}) {
  const radians = radScale(date)

  const x = Math.cos(radians) * (240 + dateRank * $nodeSize/1.5) * $pixelRatio + $width * $pixelRatio/2
  const y = Math.sin(radians) * (240 + dateRank * $nodeSize/1.5) * $pixelRatio + $height * $pixelRatio/2
  
  return { x, y, radians }
}

</script>

<svelte:window
  bind:innerWidth={$width} 
  bind:innerHeight={$height} 
  bind:devicePixelRatio={$pixelRatio} 
/>

{#if $plotWidth > 0}
  <Canvas>
    {#key $width + asBlock}
      {#each nodes as node, i}
      {@const { x, y, radians } = asBlock ? getNodeBlockPos(i) : getNodeRadPos(node)}
        <Unit x={x} y={y} rotation={radians}/>
      {/each}
    {/key}
  </Canvas>
{/if}

<button 
  style:position='fixed'
  style:top="12px"
  style:right="12px"
  on:click={() => asBlock = !asBlock}
>
  {asBlock ? 'Block' : 'Radial'}
</button>