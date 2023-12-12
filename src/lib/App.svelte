<script>
  import { width, height, pixelRatio } from "$lib/store/canvas";
  import { nodes } from "$lib/store/nodes";

  import Canvas from "$lib/components/Canvas.svelte";
  import Unit from "$lib/components/Unit.svelte";
  import Layout from "$lib/components/Layout.svelte";

  let isBlock = false
  let sortBy = 'year'
</script>

<svelte:window
  bind:innerWidth={$width} 
  bind:innerHeight={$height} 
  bind:devicePixelRatio={$pixelRatio} 
/>

<Layout bind:isBlock bind:sortBy>
  <Canvas key="main" />
  <Canvas key="goals" composition='multiply' mixBlendMode='multiply'/>
  {#each $nodes as node (node.id)}
    <Unit {node} />
  {/each}
</Layout>

<button 
  style:position='fixed'
  style:top="12px"
  style:right="12px"
  on:click={() => isBlock = !isBlock}
>
  {isBlock ? 'Block' : 'Radial'}
</button>