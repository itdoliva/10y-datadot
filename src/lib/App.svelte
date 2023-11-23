<script>
  import Canvas from "$lib/components/Canvas.svelte";
  import Unit from "$lib/components/SimpleUnit.svelte";
  import { width, height, pixelRatio, nNodes, nodeSize, gap, plotWidth, padding } from "$lib/store/canvas";

  nNodes.set(387)

  function getNodePos(i) {
    // Calculate the number of squares per row
    const squaresPerRow = Math.floor(($plotWidth + $gap) / ($nodeSize + $gap))

    // Calculate the row and column indices for the given i
    const rowIndex = Math.floor(i / squaresPerRow)
    const colIndex = i % squaresPerRow

    // Calculate the x and y positions
    const x = colIndex * ($nodeSize + $gap) + $nodeSize/2 + $padding.left
    const y = rowIndex * ($nodeSize + $gap) + $nodeSize/2 + $padding.top

    return { x, y };
}

</script>

<svelte:window
  bind:innerWidth={$width} 
  bind:innerHeight={$height} 
  bind:devicePixelRatio={$pixelRatio} 
/>

{#if $plotWidth > 0}
  <Canvas>
    {#key $width}
      {#each {length: $nNodes} as _, i}
      {@const { x, y } = getNodePos(i)}
        <Unit x={x} y={y}/>
      {/each}
    {/key}
  </Canvas>
{/if}